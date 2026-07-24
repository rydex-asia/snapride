import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CatalogQueryDto {
  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
