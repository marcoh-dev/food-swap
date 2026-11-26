import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { CreatePushSubscriptionDto } from "./dtos/createPushSubscription.dto";
import { PushSubscription } from "./entities/pushSubscription.entity";

@Injectable()
export class PushService {
	constructor(
		@InjectRepository(PushSubscription)
		private readonly subscriptions: Repository<PushSubscription>,
	) {}

	/**
	 * Saves a device's subscription for the user, or renews it (`lastSeenAt`). The endpoint is unique
	 * per device, so if another account logged in on the same browser, it moves to this user.
	 */
	async save(userId: string, { type, endpoint, keys }: CreatePushSubscriptionDto): Promise<void> {
		await this.subscriptions.upsert(
			{
				userId,
				type,
				endpoint,
				p256dh: keys.p256dh,
				auth: keys.auth,
				lastSeenAt: new Date(),
			},
			["endpoint"],
		);
	}

	/** Deletes a device's subscription, but only the user's own (e.g. on logout). */
	async remove(userId: string, endpoint: string): Promise<void> {
		await this.subscriptions.delete({ userId, endpoint });
	}
}
