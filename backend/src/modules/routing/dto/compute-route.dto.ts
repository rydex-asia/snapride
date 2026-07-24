import { IsIn, IsLatitude, IsLongitude, IsOptional } from 'class-validator';

export class ComputeRouteDto {
  @IsLatitude()
  originLatitude!: number;

  @IsLongitude()
  originLongitude!: number;

  @IsLatitude()
  destinationLatitude!: number;

  @IsLongitude()
  destinationLongitude!: number;

  @IsOptional()
  @IsIn(['DRIVE', 'TWO_WHEELER'])
  travelMode: 'DRIVE' | 'TWO_WHEELER' = 'DRIVE';
}
