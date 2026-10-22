import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { PaginationQueryDto } from '../../common/dtos/paginationQuery.dto';
import { Transform, Type } from 'class-transformer';
import { toSlugArray } from '../../common/utils/trim-string';

export const RADIUS_OPTIONS_KM = [5, 10, 20, 50];

export class ListingsQueryDto extends OmitType(PaginationQueryDto, [
  'sort',
] as const) {
  @IsOptional()
  @IsIn(['newest', 'endingSoon', 'nearest'])
  sort?: 'newest' | 'endingSoon' | 'nearest';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  term?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-z0-9-]+$/)
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
