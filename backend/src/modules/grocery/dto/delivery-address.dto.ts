import { IsBoolean, IsLatitude, IsLongitude, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class DeliveryAddressDto {
  @IsString()
  @MaxLength(30)
  label!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(240)
  addressLine!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  house?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  landmark?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  deliveryInstructions?: string;

  @IsString()
  @MaxLength(80)
  recipientName!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(16)
  phone!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
