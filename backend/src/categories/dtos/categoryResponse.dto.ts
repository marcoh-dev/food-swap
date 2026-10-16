import { Expose } from 'class-transformer';

export class CategoryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  slug!: string;

  @Expose()
  name!: string;
}
