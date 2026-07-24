import { IsDateString, IsLatitude, IsLongitude, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateLocationDto {
  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsOptional()
  @IsNumber()
  speedMps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracyM?: number;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
