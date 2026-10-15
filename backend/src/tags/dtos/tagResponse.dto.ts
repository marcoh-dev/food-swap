import { Expose } from 'class-transformer';

export class TagResponseDto {
  @Expose()
  id!: string;

  @Expose()
  slug!: string;

  @Expose()
  name!: string;
}
