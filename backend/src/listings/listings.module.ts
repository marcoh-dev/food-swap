import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Listing } from "./entities/listing.entity";
import { ListingsController } from "./listings.controller";
import { ListingsService } from "./listings.service";
import { CategoriesModule } from "../categories/categories.module";
import { PlacesModule } from "../places/places.module";
import { TagsModule } from "../tags/tags.module";
import { User } from "../users/entities/user.entity";

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
