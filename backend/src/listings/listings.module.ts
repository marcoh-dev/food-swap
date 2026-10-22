import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { Listing } from './entities/listing.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CategoriesModule } from '../categories/categories.module';
import { TagsModule } from '../tags/tags.module';
import { PlacesModule } from '../places/places.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, User]),
    CategoriesModule,
    TagsModule,
    PlacesModule,
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService, TypeOrmModule],
})
export class ListingsModule {}
