import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { trimString } from '../../common/utils/trim-string';

export class PlacesQueryDto {
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q!: string;
}
