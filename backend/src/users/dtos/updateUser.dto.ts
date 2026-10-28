import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['username'] as const),
) {
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  placeId?: string | null;
}
