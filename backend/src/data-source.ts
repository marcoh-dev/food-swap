import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import { Listing } from './listings/entities/listing.entity';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Tag } from './tags/entities/tag.entity';
import { Chat } from './chats/entities/chat.entity';
import { Message } from './chats/entities/message.entity';
import { Place } from './places/entities/place.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Listing, User, Category, Tag, Chat, Message, Place],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false, // Absolutely critical to disable this here
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
