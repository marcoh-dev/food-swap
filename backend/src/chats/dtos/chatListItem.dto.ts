import { Expose, Type } from 'class-transformer';

export class ChatListItemDto {
  @Expose()
  id!: string;

  @Expose()
  listingTitle!: string | null;

  @Expose()
  otherName!: string | null;

  @Expose()
  lastMessage!: string | null;

  @Expose()
  @Type(() => Date)
  lastMessageAt!: Date;
}
