import { VehicleType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVehicleDto {
  @IsEnum(VehicleType)
  type!: VehicleType;

  @IsString()
  @MinLength(4)
  plateNumber!: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
