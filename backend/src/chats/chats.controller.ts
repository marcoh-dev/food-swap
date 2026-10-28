import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Request,
} from "@nestjs/common";

import { ChatsService } from "./chats.service";
import type { AuthenticatedRequest } from "../auth/login.types";
import { SendMessageDto } from "./dtos/sendMessage.dto";
import { StartChatDto } from "./dtos/startChat.dto";

@Controller("chats")
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Get()
	findAll(@Request() req: AuthenticatedRequest) {
		return this.chatsService.findAll(req.user);
	}

	@Get("unread-count")
	countUnread(@Request() req: AuthenticatedRequest) {
		return this.chatsService.countUnread(req.user);
	}

	@Get("listing/:listingId")
	findForListing(
		@Request() req: AuthenticatedRequest,
		@Param("listingId", ParseUUIDPipe) listingId: string,
	) {
		return this.chatsService.findForListing(listingId, req.user);
	}

	@Get(":id")
	findOne(@Request() req: AuthenticatedRequest, @Param("id", ParseUUIDPipe) chatId: string) {
		return this.chatsService.findOne(chatId, req.user);
	}

	@Post(":id/read")
	@HttpCode(HttpStatus.NO_CONTENT)
	markRead(@Request() req: AuthenticatedRequest, @Param("id", ParseUUIDPipe) chatId: string) {
		return this.chatsService.markRead(chatId, req.user);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Request() req: AuthenticatedRequest, @Param("id", ParseUUIDPipe) chatId: string) {
		return this.chatsService.remove(chatId, req.user);
	}

	@Post()
	start(@Request() req: AuthenticatedRequest, @Body() chatPayload: StartChatDto) {
		return this.chatsService.sendToListing(chatPayload, req.user);
	}

	@Post(":id/messages")
	reply(
		@Request() req: AuthenticatedRequest,
		@Param("id", ParseUUIDPipe) chatId: string,
		@Body() chatPayload: SendMessageDto,
	) {
		return this.chatsService.reply(chatId, chatPayload.content, req.user);
	}
}
