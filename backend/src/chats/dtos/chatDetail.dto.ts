import { Expose, Type } from 'class-transformer';
import { MessageResponseDto } from './messageResponse.dto';

export class ChatDetailDto {
  @Expose()
  id!: string;

  @Expose()
  listingId!: string | null;

  @Expose()
  listingTitle!: string | null;

  @Expose()
  otherName!: string | null;

  @Expose()
  canReply!: boolean;

  @Expose()
  @Type(() => MessageResponseDto)
  messages!: MessageResponseDto[];
}
