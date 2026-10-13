import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { Listing } from '../listings/entities/listing.entity';
import { ChatsController } from './chats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, User, Listing])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService, TypeOrmModule],
})
export class ChatsModule {}
