import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dtos/userResponse.dto';
import { ListingType } from '../entities/listing.entity';

export class ListingResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  image!: string | null;

  @Expose()
  location!: string;

  @Expose()
  type!: ListingType;

  @Expose()
  @Type(() => UserResponseDto)
  owner!: UserResponseDto;

  @Expose()
  @Type(() => Date)
  createdAt!: Date;

  @Expose()
  @Type(() => Date)
  endDate!: Date;
}
