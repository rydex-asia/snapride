import { GroceryOrderStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroceryStatusDto {
  @IsEnum(GroceryOrderStatus) status!: GroceryOrderStatus;
  @IsOptional() @IsString() @MaxLength(240) detail?: string;
}
