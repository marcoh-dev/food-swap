import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dtos/userResponse.dto';

export class ListingResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  @Type(() => UserResponseDto)
  seller!: UserResponseDto;

  @Expose()
  startingPrice!: number;

  @Expose()
  currentPrice!: number | null;

  @Expose()
  @Type(() => Date)
  createdAt!: Date;

  @Expose()
  @Type(() => Date)
  endDate!: Date;
}
