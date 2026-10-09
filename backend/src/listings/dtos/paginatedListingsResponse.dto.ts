import { Expose, Type } from 'class-transformer';
import { PaginationMetaResponseDto } from '../../common/dtos/paginationMetaResponse.dto';
import { ListingResponseDto } from './listingResponse.dto';

export class PaginatedListingsResponseDto {
  @Expose()
  @Type(() => ListingResponseDto)
  data!: ListingResponseDto[];

  @Expose()
  @Type(() => PaginationMetaResponseDto)
  meta!: PaginationMetaResponseDto;
}
