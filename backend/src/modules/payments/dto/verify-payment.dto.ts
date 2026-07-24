import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @MaxLength(80)
  paymentId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  gateway?: string;

  @IsString()
  @MaxLength(120)
  gatewayOrderId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  gatewayPaymentId?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(256)
  gatewaySignature?: string;
}
