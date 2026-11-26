import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PushSubscription } from "./entities/pushSubscription.entity";

@Module({
	imports: [TypeOrmModule.forFeature([PushSubscription])],
})
export class PushModule {}
