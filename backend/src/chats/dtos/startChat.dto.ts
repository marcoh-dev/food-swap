import { IsUUID } from "class-validator";

import { SendMessageDto } from "./sendMessage.dto";

export class StartChatDto extends SendMessageDto {
	@IsUUID()
	listingId!: string;
}
