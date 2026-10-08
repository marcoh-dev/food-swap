import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from '../../common/utils/trim-string';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  password!: string;
}
