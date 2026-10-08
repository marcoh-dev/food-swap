import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/utils/trim-string';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @Transform(trimString)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Transform(trimString)
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character',
  })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trimString)
  name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(trimString)
  location?: string | null;
}
