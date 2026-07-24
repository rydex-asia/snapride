import { SourceApp, VehicleType } from '@prisma/client';
import { IsEnum, IsLatitude, IsLongitude, IsNumber, IsString, Min } from 'class-validator';

export class CreateRideDto {
  @IsEnum(SourceApp)
  sourceApp!: SourceApp;

  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @IsString()
  pickupAddress!: string;

  @IsLatitude()
  pickupLat!: number;

  @IsLongitude()
  pickupLng!: number;

  @IsString()
  dropAddress!: string;

  @IsLatitude()
  dropLat!: number;

  @IsLongitude()
  dropLng!: number;

  @IsNumber()
  @Min(0)
  estimatedFare!: number;
}
