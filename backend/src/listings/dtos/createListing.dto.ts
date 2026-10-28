import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

import { trimString } from '../../common/utils/trim-string';
import { ListingType } from '../entities/listing.entity';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(trimString)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(trimString)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(trimString)
  image?: string;

  @IsUUID()
  placeId!: string;

  @IsEnum(ListingType)
  type!: ListingType;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  tagIds?: string[];

  // The last day of the listing ("YYYY-MM-DD"), it ends at 23:59 Berlin time.
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be a date in the format YYYY-MM-DD',
  })
  endDate?: string;
}
