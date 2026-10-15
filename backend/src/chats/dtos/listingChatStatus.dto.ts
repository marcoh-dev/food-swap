import { Expose } from 'class-transformer';

export class ListingChatStatusDto {
  @Expose()
  chatId!: string | null;

  @Expose()
  hidden!: boolean;
}
