import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChatsController } from "./chats.controller";
import { ChatsGateway } from "./chats.gateway";
import { ChatsService } from "./chats.service";
import { Chat } from "./entities/chat.entity";
import { Message } from "./entities/message.entity";
import { Listing } from "../listings/entities/listing.entity";
import { PushModule } from "../push/push.module";
import { User } from "../users/entities/user.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Chat, Message, User, Listing]), PushModule],
	controllers: [ChatsController],
	providers: [ChatsService, ChatsGateway],
	exports: [ChatsService, ChatsGateway, TypeOrmModule],
})
export class ChatsModule {}
