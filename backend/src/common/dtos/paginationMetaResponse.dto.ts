import { Expose } from 'class-transformer';

export class PaginationMetaResponseDto {
  @Expose()
  page!: number;

  @Expose()
  limit!: number;

  @Expose()
  total!: number;

  @Expose()
  totalPages!: number;
}
