import { Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PartnerStatus } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { RealtimeService } from '../../shared/socket/realtime.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class PartnersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PartnersService.name);
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.cleanupTimer = setInterval(() => void this.deleteExpiredLocationSamples(), 60 * 60 * 1000);
    this.cleanupTimer.unref?.();
    void this.deleteExpiredLocationSamples();
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  private async deleteExpiredLocationSamples() {
    const retentionHours = this.config.get<number>('LOCATION_RAW_RETENTION_HOURS', 24);
    const createdAt = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
    try {
      const result = await this.prisma.partnerLocation.deleteMany({ where: { createdAt: { lt: createdAt } } });
      if (result.count) this.logger.log(`Deleted ${result.count} expired raw location samples`);
    } catch (error) {
      this.logger.error(`Location retention cleanup failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async getPartnerForUser(userId: string) {
    const partner = await this.prisma.partner.findUnique({ where: { userId }, include: { vehicles: true } });
    if (!partner) throw new NotFoundException('Partner profile not found');
    return partner;
  }

  async goOnline(userId: string) {
    const partner = await this.getPartnerForUser(userId);
    return this.prisma.partner.update({ where: { id: partner.id }, data: { status: PartnerStatus.ONLINE } });
  }

  async goOffline(userId: string) {
    const partner = await this.getPartnerForUser(userId);
    return this.prisma.partner.update({ where: { id: partner.id }, data: { status: PartnerStatus.OFFLINE } });
  }

  async addVehicle(userId: string, dto: CreateVehicleDto) {
    const partner = await this.getPartnerForUser(userId);
    return this.prisma.vehicle.create({
      data: { partnerId: partner.id, type: dto.type, plateNumber: dto.plateNumber, make: dto.make, model: dto.model },
    });
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const partner = await this.getPartnerForUser(userId);
    const recordedAt = dto.recordedAt ? new Date(dto.recordedAt) : new Date();
    const ageMs = Date.now() - recordedAt.getTime();
    if (!Number.isFinite(recordedAt.getTime()) || ageMs > 60_000 || ageMs < -10_000 || (dto.accuracyM ?? 0) > 200) {
      return { ignored: true, reason: 'STALE_OR_INACCURATE_LOCATION' };
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.partnerLocation.create({
        data: {
          partnerId: partner.id,
          latitude: dto.latitude,
          longitude: dto.longitude,
          heading: dto.heading,
          speedMps: dto.speedMps,
          accuracyM: dto.accuracyM,
        },
      });

      return tx.partner.update({
        where: { id: partner.id },
        data: {
          latitude: dto.latitude,
          longitude: dto.longitude,
          heading: dto.heading,
          lastSeenAt: new Date(),
        },
      });
    });

    await this.realtime.broadcastFleetEvent('partner_location_update', {
      partnerId: partner.id,
      latitude: dto.latitude,
      longitude: dto.longitude,
      heading: dto.heading,
      speedMps: dto.speedMps,
      accuracyM: dto.accuracyM,
      recordedAt: recordedAt.toISOString(),
      timestamp: recordedAt.getTime(),
      activeOrderId: partner.activeOrderId,
      activeOrderType: partner.activeOrderType,
    });

    if (partner.activeOrderId && partner.activeOrderType) {
      const payload = {
        partnerId: partner.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
        heading: dto.heading,
        speedMps: dto.speedMps,
        accuracyM: dto.accuracyM,
        recordedAt: recordedAt.toISOString(),
        timestamp: recordedAt.getTime(),
        updatedAt: new Date(),
      };
      this.realtime.emitToOrder(partner.activeOrderType, partner.activeOrderId, 'partner_location_update', payload);
      if (partner.activeOrderType === 'GROCERY') {
        const order = await this.prisma.groceryOrder.findUnique({ where: { id: partner.activeOrderId }, select: { customerId: true } });
        if (order) this.realtime.emitToUser(order.customerId, 'partner_location_update', { ...payload, orderId: partner.activeOrderId });
      }
    }

    return updated;
  }
}
