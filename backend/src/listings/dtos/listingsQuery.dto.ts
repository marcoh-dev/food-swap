import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dtos/paginationQuery.dto';
import { Transform } from 'class-transformer';
import { toSlugArray } from '../../common/utils/trim-string';

export class ListingsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  term?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => toSlugArray(value))
  @IsString({ each: true })
  tags?: string[];
}
