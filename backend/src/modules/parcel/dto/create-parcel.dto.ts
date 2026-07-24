import { SourceApp } from '@prisma/client';
import { IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateParcelDto {
  @IsEnum(SourceApp)
  sourceApp!: SourceApp;

  @IsString()
  senderName!: string;

  @IsString()
  senderPhone!: string;

  @IsString()
  receiverName!: string;

  @IsString()
  receiverPhone!: string;

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

  @IsOptional()
  @IsString()
  notes?: string;
}
