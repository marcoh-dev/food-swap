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
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import type { AuthenticatedRequest } from '../auth/login.types';
import { StartChatDto } from './dtos/startChat.dto';
import { SendMessageDto } from './dtos/sendMessage.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.chatsService.findAll(req.user);
  }

  @Get('listing/:listingId')
  findForListing(
    @Request() req: AuthenticatedRequest,
    @Param('listingId', ParseUUIDPipe) listingId: string,
  ) {
    return this.chatsService.findForListing(listingId, req.user);
  }

  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) chatId: string,
  ) {
    return this.chatsService.findOne(chatId, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) chatId: string,
  ) {
    return this.chatsService.remove(chatId, req.user);
  }

  @Post()
  start(
    @Request() req: AuthenticatedRequest,
    @Body() chatPayload: StartChatDto,
  ) {
    return this.chatsService.sendToListing(chatPayload, req.user);
  }

  @Post(':id/messages')
  reply(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() chatPayload: SendMessageDto,
  ) {
    return this.chatsService.reply(chatId, chatPayload.content, req.user);
  }
}
