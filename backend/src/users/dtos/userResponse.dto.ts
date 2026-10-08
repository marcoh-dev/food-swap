import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  username!: string;

  @Expose()
  name!: string;

  @Expose()
  createdAt!: Date;

  @Exclude()
  passwordHash!: string;
}
