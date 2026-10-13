import { Expose, Type } from 'class-transformer';

export class ChatListItemDto {
  @Expose()
  id!: string;

  @Expose()
  listingTitle!: string | null;

  @Expose()
  otherUsername!: string | null;

  @Expose()
  lastMessage!: string | null;

  @Expose()
  @Type(() => Date)
  lastMessageAt!: Date;
}
