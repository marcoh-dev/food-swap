import { Expose, Type } from 'class-transformer';
import { PlaceResponseDto } from '../../places/dtos/placeResponse.dto';

export class CurrentUserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  username!: string;

  @Expose()
  name!: string | null;

  @Expose()
  @Type(() => PlaceResponseDto)
  place!: PlaceResponseDto | null;
}
