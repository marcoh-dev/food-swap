import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class NearestPlaceDto {
  @IsNumber()
  @IsLatitude()
  lat!: number;

  @IsNumber()
  @IsLongitude()
  lng!: number;
}
