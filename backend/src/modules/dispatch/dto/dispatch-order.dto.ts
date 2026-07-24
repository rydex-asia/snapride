import { OrderType, SourceApp, VehicleType } from '@prisma/client';
import { IsEnum, IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class DispatchOrderDto {
  @IsEnum(SourceApp)
  sourceApp!: SourceApp;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsString()
  orderId!: string;

  @IsLatitude()
  pickupLat!: number;

  @IsLongitude()
  pickupLng!: number;

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;
}
