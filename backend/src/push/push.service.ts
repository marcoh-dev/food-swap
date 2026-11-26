import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import webpush, { WebPushError } from "web-push";

import type { CreatePushSubscriptionDto } from "./dtos/createPushSubscription.dto";
import { PushSubscription, PushSubscriptionType } from "./entities/pushSubscription.entity";
import type { PushMessage } from "./pushMessage";

// The push service's answer when a subscription no longer exists (unsubscribed or expired)
const GONE_STATUS_CODES = [404, 410];

@Injectable()
export class PushService {
	private readonly logger = new Logger(PushService.name);
	private readonly webPushEnabled: boolean;

	constructor(
		@InjectRepository(PushSubscription)
		private readonly subscriptions: Repository<PushSubscription>,
		configService: ConfigService,
	) {
		const publicKey = configService.get<string>("VAPID_PUBLIC_KEY");
		const privateKey = configService.get<string>("VAPID_PRIVATE_KEY");
		const subject = configService.get<string>("VAPID_SUBJECT");

		// Without keys (e.g. locally or in tests) everything works, only no web push is sent
		if (publicKey && privateKey && subject) {
			webpush.setVapidDetails(subject, publicKey, privateKey);
			this.webPushEnabled = true;
		} else {
			this.webPushEnabled = false;
			this.logger.log(
				"Web push is off: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY or VAPID_SUBJECT is missing.",
			);
		}
	}

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

	/**
	 * Sends a push to all of the user's devices. Never throws: a failed push must not affect what
	 * triggered it (e.g. sending a chat message); subscriptions the push service no longer knows
	 * are deleted.
	 */
	async sendToUser(userId: string, message: PushMessage): Promise<void> {
		if (!this.webPushEnabled) return;

		try {
			const subscriptions = await this.subscriptions.findBy({
				userId,
				type: PushSubscriptionType.WEB,
			});

			const payload = JSON.stringify(message);
			await Promise.all(
				subscriptions.map((subscription) => this.sendWebPush(subscription, payload)),
			);
		} catch (error) {
			this.logger.error(
				"Sending a push failed.",
				error instanceof Error ? error.stack : error,
			);
		}
	}

	private async sendWebPush(subscription: PushSubscription, payload: string): Promise<void> {
		try {
			await webpush.sendNotification(
				{
					endpoint: subscription.endpoint,
					keys: { p256dh: subscription.p256dh ?? "", auth: subscription.auth ?? "" },
				},
				payload,
			);
		} catch (error) {
			if (error instanceof WebPushError && GONE_STATUS_CODES.includes(error.statusCode)) {
				await this.subscriptions.delete({ id: subscription.id });
				return;
			}
			this.logger.warn(
				`Web push to ${new URL(subscription.endpoint).host} failed.`,
				error instanceof Error ? error.message : error,
			);
		}
	}
}
