import { Expose, Type } from 'class-transformer';
import { MessageResponseDto } from './messageResponse.dto';

export class ChatDetailDto {
  @Expose()
  id!: string;

  @Expose()
  listingId!: string | null; // null → listing was deleted

  @Expose()
  listingTitle!: string | null;

  @Expose()
  otherUsername!: string | null; // null → account was deleted

  @Expose()
  canReply!: boolean; // false once the other participant's account is deleted

  @Expose()
  @Type(() => MessageResponseDto)
  messages!: MessageResponseDto[];
}
