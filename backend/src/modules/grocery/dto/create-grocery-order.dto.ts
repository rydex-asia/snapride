import { SourceApp } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsLatitude, IsLongitude, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

class GroceryItemDto {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateGroceryOrderDto {
  @IsEnum(SourceApp)
  sourceApp!: SourceApp;

  @IsString()
  storeId!: string;

  @IsString()
  deliveryAddress!: string;

  @IsLatitude()
  deliveryLat!: number;

  @IsLongitude()
  deliveryLng!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroceryItemDto)
  items!: GroceryItemDto[];
}
