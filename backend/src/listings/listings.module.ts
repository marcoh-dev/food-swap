import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { Listing } from './entities/listing.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, User])],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService, TypeOrmModule],
})
export class ListingsModule {}
