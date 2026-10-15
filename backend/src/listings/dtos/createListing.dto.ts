import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ListingType } from '../entities/listing.entity';
import { trimString } from '../../common/utils/trim-string';

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

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(trimString)
  location!: string;

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

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
