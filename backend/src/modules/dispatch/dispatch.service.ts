import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DispatchStatus,
  GroceryOrderStatus,
  OrderType,
  ParcelStatus,
  PartnerStatus,
  Prisma,
  RideStatus,
  VehicleType,
} from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { RealtimeService } from '../../shared/socket/realtime.service';
import { haversineMeters } from '../../shared/utils/geo.util';
import { DispatchOrderDto } from './dto/dispatch-order.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  async dispatch(dto: DispatchOrderDto) {
    const partner = await this.findNearestAvailablePartner(dto.pickupLat, dto.pickupLng, dto.vehicleType);

    const job = await this.prisma.$transaction(async (tx) => {
      const dispatchJob = await tx.dispatchJob.create({
        data: {
          sourceApp: dto.sourceApp,
          orderType: dto.orderType,
          orderId: dto.orderId,
          status: partner ? DispatchStatus.ASSIGNED : DispatchStatus.QUEUED,
          partnerId: partner?.id,
          expiresAt: partner ? new Date(Date.now() + 45_000) : undefined,
          ...this.orderRelationData(dto.orderType, dto.orderId),
        },
      });

      if (partner) {
        await tx.partner.update({
          where: { id: partner.id },
          data: { status: PartnerStatus.BUSY, activeOrderType: dto.orderType, activeOrderId: dto.orderId },
        });
        await this.attachPartnerToOrder(tx, dto.orderType, dto.orderId, partner.id);
      }

      return dispatchJob;
    });

    await this.realtime.broadcastFleetEvent('order_created', dto);
    if (partner) {
      this.realtime.emitToPartner(partner.id, 'order_assigned', { ...dto, dispatchJobId: job.id });
      this.realtime.emitToOrder(dto.orderType, dto.orderId, 'order_assigned', { partnerId: partner.id });
    }
    if (dto.orderType === OrderType.GROCERY) {
      const order = await this.prisma.groceryOrder.findUnique({ where: { id: dto.orderId } });
      if (order) {
        const status = partner ? GroceryOrderStatus.ASSIGNED : GroceryOrderStatus.SEARCHING_PARTNER;
        const title = partner ? 'Delivery partner assigned' : 'Finding a delivery partner';
        const detail = partner ? 'Your delivery partner is heading to the store.' : 'We’ll assign a nearby partner shortly.';
        const event = await this.prisma.groceryOrderStatusEvent.create({ data: { orderId: order.id, status, title, detail } });
        const payload = { orderId: order.id, status, title, detail, event };
        this.realtime.emitToOrder('GROCERY', order.id, 'grocery_order_updated', payload);
        this.realtime.emitToUser(order.customerId, 'grocery_order_updated', payload);
        await this.notifications.notify(order.customerId, title, detail, { type: 'GROCERY_ORDER', orderId: order.id, status });
      }
    }

    return { job, partner };
  }

  async accept(jobId: string, partnerUserId: string) {
    const partner = await this.prisma.partner.findUnique({ where: { userId: partnerUserId } });
    if (!partner) throw new NotFoundException('Partner profile not found');

    const job = await this.prisma.dispatchJob.findUnique({ where: { id: jobId } });
    if (!job || job.partnerId !== partner.id) throw new NotFoundException('Dispatch job not found');

    const accepted = await this.prisma.dispatchJob.update({
      where: { id: jobId },
      data: { status: DispatchStatus.ACCEPTED, acceptedAt: new Date() },
    });

    this.realtime.emitToOrder(job.orderType, job.orderId, 'order_accepted', { partnerId: partner.id, orderId: job.orderId });
    return accepted;
  }

  async reassign(jobId: string) {
    const job = await this.prisma.dispatchJob.update({
      where: { id: jobId },
      data: { status: DispatchStatus.REASSIGNING, partnerId: null, attempts: { increment: 1 } },
    });
    return this.dispatch({
      sourceApp: job.sourceApp,
      orderType: job.orderType,
      orderId: job.orderId,
      pickupLat: 0,
      pickupLng: 0,
    });
  }

  private async findNearestAvailablePartner(latitude: number, longitude: number, vehicleType?: VehicleType) {
    const partners = await this.prisma.partner.findMany({
      where: {
        status: PartnerStatus.ONLINE,
        latitude: { not: null },
        longitude: { not: null },
        vehicles: vehicleType ? { some: { type: vehicleType, isActive: true } } : { some: { isActive: true } },
      },
      include: { vehicles: true },
      take: 50,
    });

    return partners
      .map((partner) => ({
        ...partner,
        distanceMeters: haversineMeters(
          { latitude, longitude },
          { latitude: Number(partner.latitude), longitude: Number(partner.longitude) },
        ),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  }

  private orderRelationData(orderType: OrderType, orderId: string) {
    if (orderType === OrderType.RIDE) return { rideOrderId: orderId };
    if (orderType === OrderType.PARCEL) return { parcelOrderId: orderId };
    return { groceryOrderId: orderId };
  }

  private async attachPartnerToOrder(tx: Prisma.TransactionClient, orderType: OrderType, orderId: string, partnerId: string) {
    if (orderType === OrderType.RIDE) {
      await tx.rideOrder.update({ where: { id: orderId }, data: { partnerId, status: RideStatus.ACCEPTED } });
      return;
    }
    if (orderType === OrderType.PARCEL) {
      await tx.parcelOrder.update({ where: { id: orderId }, data: { partnerId, status: ParcelStatus.ACCEPTED } });
      return;
    }
    await tx.groceryOrder.update({ where: { id: orderId }, data: { partnerId, status: GroceryOrderStatus.ASSIGNED } });
  }
}
