import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PushSubscription } from "./entities/pushSubscription.entity";
import { PushController } from "./push.controller";
import { PushService } from "./push.service";

@Module({
	imports: [TypeOrmModule.forFeature([PushSubscription])],
	controllers: [PushController],
	providers: [PushService],
	exports: [PushService],
})
export class PushModule {}
