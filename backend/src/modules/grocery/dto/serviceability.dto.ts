import { IsLatitude, IsLongitude } from 'class-validator';

export class ServiceabilityDto {
  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;
}
