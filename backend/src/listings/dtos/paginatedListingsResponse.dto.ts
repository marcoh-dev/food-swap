import { Expose, Type } from 'class-transformer';

import { ListingResponseDto } from './listingResponse.dto';
import { PaginationMetaResponseDto } from '../../common/dtos/paginationMetaResponse.dto';

export class PaginatedListingsResponseDto {
  @Expose()
  @Type(() => ListingResponseDto)
  data!: ListingResponseDto[];

  @Expose()
  @Type(() => PaginationMetaResponseDto)
  meta!: PaginationMetaResponseDto;
}
