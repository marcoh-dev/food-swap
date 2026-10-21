import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dtos/paginationQuery.dto';
import { Transform, Type } from 'class-transformer';
import { toSlugArray } from '../../common/utils/trim-string';

export const RADIUS_OPTIONS_KM = [5, 10, 20, 50];

export class ListingsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  term?: string;

  @IsOptional()
  @IsUUID()
  place?: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn(RADIUS_OPTIONS_KM)
  radius?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => toSlugArray(value))
  @IsString({ each: true })
  tags?: string[];
}
