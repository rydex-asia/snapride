import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderType, PartnerStatus, RideStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DispatchService } from '../dispatch/dispatch.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { RealtimeService } from '../../shared/socket/realtime.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { VerifyRideOtpDto } from './dto/verify-ride-otp.dto';

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: DispatchService,
    private readonly realtime: RealtimeService,
  ) {}

  async create(customerId: string, dto: CreateRideDto) {
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const ride = await this.prisma.rideOrder.create({
      data: {
        sourceApp: dto.sourceApp,
        customerId,
        vehicleType: dto.vehicleType,
        pickupAddress: dto.pickupAddress,
        pickupLat: dto.pickupLat,
        pickupLng: dto.pickupLng,
        dropAddress: dto.dropAddress,
        dropLat: dto.dropLat,
        dropLng: dto.dropLng,
        estimatedFare: dto.estimatedFare,
        otpHash: await bcrypt.hash(otp, 10),
      },
    });

    const dispatch = await this.dispatch.dispatch({
      sourceApp: dto.sourceApp,
      orderType: OrderType.RIDE,
      orderId: ride.id,
      pickupLat: dto.pickupLat,
      pickupLng: dto.pickupLng,
      vehicleType: dto.vehicleType,
    });

    return { ride, dispatch, otp };
  }

  async findOne(rideId: string) {
    const ride = await this.prisma.rideOrder.findUnique({
      where: { id: rideId },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        partner: {
          include: {
            user: { select: { id: true, fullName: true, phone: true } },
            vehicles: { where: { isActive: true }, take: 1 },
          },
        },
      },
    });
    if (!ride) throw new NotFoundException('Ride not found');
    return ride;
  }

  async findActiveForPartner(partnerUserId: string) {
    const partner = await this.prisma.partner.findUnique({ where: { userId: partnerUserId } });
    if (!partner) throw new NotFoundException('Partner profile not found');

    return this.prisma.rideOrder.findFirst({
      where: {
        partnerId: partner.id,
        status: { in: [RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.STARTED] },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        partner: {
          include: {
            user: { select: { id: true, fullName: true, phone: true } },
            vehicles: { where: { isActive: true }, take: 1 },
          },
        },
      },
    });
  }

  async arrive(rideId: string) {
    const updated = await this.prisma.rideOrder.update({
      where: { id: rideId },
      data: { status: RideStatus.ARRIVED },
    });
    this.realtime.emitToOrder(OrderType.RIDE, rideId, 'ride_arrived', updated);
    return updated;
  }

  async verifyOtp(rideId: string, dto: VerifyRideOtpDto) {
    const ride = await this.prisma.rideOrder.findUnique({ where: { id: rideId } });
    if (!ride?.otpHash) throw new NotFoundException('Ride not found');
    const valid = await bcrypt.compare(dto.otp, ride.otpHash);
    if (!valid) throw new BadRequestException('Invalid ride OTP');

    const updated = await this.prisma.rideOrder.update({
      where: { id: rideId },
      data: { status: RideStatus.STARTED, startedAt: new Date() },
    });
    this.realtime.emitToOrder(OrderType.RIDE, rideId, 'ride_started', updated);
    return updated;
  }

  async complete(rideId: string) {
    const updated = await this.prisma.rideOrder.update({
      where: { id: rideId },
      data: { status: RideStatus.COMPLETED, completedAt: new Date() },
    });
    await this.prisma.partner.updateMany({
      where: { activeOrderId: rideId, activeOrderType: OrderType.RIDE },
      data: { activeOrderId: null, activeOrderType: null, status: PartnerStatus.ONLINE },
    });
    this.realtime.emitToOrder(OrderType.RIDE, rideId, 'ride_completed', updated);
    return updated;
  }
}
