import { Injectable } from '@nestjs/common';
import { OrderType, VehicleType } from '@prisma/client';
import { DispatchService } from '../dispatch/dispatch.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateParcelDto } from './dto/create-parcel.dto';

@Injectable()
export class ParcelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: DispatchService,
  ) {}

  async create(customerId: string, dto: CreateParcelDto) {
    const parcel = await this.prisma.parcelOrder.create({
      data: { ...dto, customerId },
    });
    const dispatch = await this.dispatch.dispatch({
      sourceApp: dto.sourceApp,
      orderType: OrderType.PARCEL,
      orderId: parcel.id,
      pickupLat: dto.pickupLat,
      pickupLng: dto.pickupLng,
      vehicleType: VehicleType.BIKE,
    });
    return { parcel, dispatch };
  }
}
