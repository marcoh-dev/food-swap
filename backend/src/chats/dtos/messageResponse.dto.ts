import { Expose, Type } from 'class-transformer';

export class MessageResponseDto {
  @Expose()
  id!: string;

  @Expose()
  chatId!: string;

  @Expose()
  senderId!: string | null; // null → sender deleted their account

  @Expose()
  content!: string;

  @Expose()
  @Type(() => Date)
  createdAt!: Date;
}
