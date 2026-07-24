import { OrderType, PaymentProvider, SourceApp } from '@prisma/client';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;

  @IsEnum(SourceApp)
  sourceApp!: SourceApp;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  orderId?: string;

  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
