import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { Listing } from '../listings/entities/listing.entity';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { Message } from './entities/message.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, User, Listing]),
    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
  exports: [ChatsService, TypeOrmModule],
})
export class ChatsModule {}
