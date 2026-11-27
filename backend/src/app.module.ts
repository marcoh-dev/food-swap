import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { RefreshToken } from "./auth/entities/refreshToken.entity";
import { JwtAuthGuard } from "./auth/jwtAuth.guard";
import { CategoriesModule } from "./categories/categories.module";
import { Category } from "./categories/entities/category.entity";
import { ChatsModule } from "./chats/chats.module";
import { Chat } from "./chats/entities/chat.entity";
import { Message } from "./chats/entities/message.entity";
import { ClientIpThrottlerGuard } from "./common/guards/clientIpThrottler.guard";
import { GENERAL_LIMIT } from "./common/rateLimits";
import { Listing } from "./listings/entities/listing.entity";
import { ListingsModule } from "./listings/listings.module";
import { Place } from "./places/entities/place.entity";
import { PlacesModule } from "./places/places.module";
import { PushSubscription } from "./push/entities/pushSubscription.entity";
import { PushModule } from "./push/push.module";
import { Tag } from "./tags/entities/tag.entity";
import { TagsModule } from "./tags/tags.module";
import { User } from "./users/entities/user.entity";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: "postgres",
				url: configService.getOrThrow<string>("DATABASE_URL"),
				entities: [
					User,
					Listing,
					Chat,
					Message,
					Category,
					Tag,
					Place,
					RefreshToken,
					PushSubscription,
				],
				synchronize: false,
				logging: false,
				enableWAL: true,
				statementCacheSize: 100,
			}),
		}),
		ScheduleModule.forRoot(),
		ThrottlerModule.forRoot({ throttlers: [GENERAL_LIMIT] }),
		AuthModule,
		UsersModule,
		ListingsModule,
		ChatsModule,
		CategoriesModule,
		TagsModule,
		PlacesModule,
		PushModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		// Rate limits first, so failed logins and requests without a login count too
		{ provide: APP_GUARD, useClass: ClientIpThrottlerGuard },
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
	],
})
export class AppModule {}
