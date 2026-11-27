import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { LessThan, Repository } from "typeorm";
import webpush, { WebPushError } from "web-push";

import type { CreatePushSubscriptionDto } from "./dtos/createPushSubscription.dto";
import { PushSubscription, PushSubscriptionType } from "./entities/pushSubscription.entity";
import type { PushMessage } from "./pushMessage";
import { REFRESH_TOKEN_DAYS } from "../auth/auth.constants";
import { TIME_ZONE } from "../common/utils/berlin-date";

// The push service's answer when a subscription no longer exists (unsubscribed or expired)
const GONE_STATUS_CODES = [404, 410];
/**
 * The Android notification channel the app creates for chat messages (shown as
 * "Chat-Nachrichten" in the Android settings); the app must create a channel with this ID.
 */
export const CHAT_CHANNEL_ID = "chat-messages";

@Injectable()
export class PushService implements OnApplicationBootstrap {
	private readonly logger = new Logger(PushService.name);
	private readonly webPushEnabled: boolean;
	// Sends to the app through Expo's push service, which delivers through Firebase (Android)
	private readonly expo = new Expo();

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
				p256dh: keys?.p256dh ?? null,
				auth: keys?.auth ?? null,
				lastSeenAt: new Date(),
			},
			["endpoint"],
		);
	}

	/** Deletes a device's subscription, but only the user's own (e.g. on logout). */
	async remove(userId: string, endpoint: string): Promise<void> {
		await this.subscriptions.delete({ userId, endpoint });
	}

	// Also on startup: a server that sleeps when idle can miss the daily run
	async onApplicationBootstrap(): Promise<void> {
		await this.runCleanup("startup");
	}

	@Cron("0 3 * * *", { timeZone: TIME_ZONE })
	async deleteStaleDaily(): Promise<void> {
		await this.runCleanup("daily");
	}

	private async runCleanup(trigger: "startup" | "daily"): Promise<void> {
		try {
			const deleted = await this.deleteStale(new Date());
			this.logger.log(`PushCleanup (${trigger}): Deleted ${deleted} stale subscriptions.`);
		} catch (error) {
			this.logger.error(
				`PushCleanup (${trigger}): Deleting stale subscriptions failed.`,
				error instanceof Error ? error.stack : error,
			);
		}
	}

	/**
	 * Deletes subscriptions that weren't renewed within the login lifetime: the device's login has
	 * expired, so it shouldn't get pushes any more. Returns how many were deleted.
	 */
	async deleteStale(now: Date): Promise<number> {
		const oldestKept = new Date(now.getTime() - REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
		const result = await this.subscriptions.delete({ lastSeenAt: LessThan(oldestKept) });
		return result.affected ?? 0;
	}

	/** Deletes all of the user's subscriptions, e.g. on "Überall abmelden". */
	async removeAllForUser(userId: string): Promise<void> {
		await this.subscriptions.delete({ userId });
	}

	/**
	 * Sends a push to all of the user's devices. Never throws: a failed push must not affect what
	 * triggered it (e.g. sending a chat message); subscriptions the push service no longer knows
	 * are deleted.
	 */
	async sendToUser(userId: string, message: PushMessage): Promise<void> {
		try {
			const subscriptions = await this.subscriptions.findBy({ userId });
			const web = subscriptions.filter(({ type }) => type === PushSubscriptionType.WEB);
			const app = subscriptions.filter(({ type }) => type === PushSubscriptionType.EXPO);

			const payload = JSON.stringify(message);
			await Promise.all([
				// Web push needs the VAPID keys; the app's pushes go through Expo without them
				...(this.webPushEnabled
					? web.map((subscription) => this.sendWebPush(subscription, payload))
					: []),
				this.sendExpoPushes(app, message),
			]);
		} catch (error) {
			this.logger.error(
				"Sending a push failed.",
				error instanceof Error ? error.stack : error,
			);
		}
	}

	/** Sends to the app's devices; tokens Expo reports as no longer registered are deleted. */
	private async sendExpoPushes(
		subscriptions: PushSubscription[],
		{ title, body, chatId }: PushMessage,
	): Promise<void> {
		if (subscriptions.length === 0) return;

		const messages: ExpoPushMessage[] = subscriptions.map(({ endpoint }) => ({
			to: endpoint,
			title,
			body,
			// The app opens the chat when the notification is tapped
			data: { chatId },
			channelId: CHAT_CHANNEL_ID,
			priority: "high",
			sound: "default",
		}));

		try {
			for (const chunk of this.expo.chunkPushNotifications(messages)) {
				const tickets = await this.expo.sendPushNotificationsAsync(chunk);
				await Promise.all(
					tickets.map(async (ticket, index) => {
						if (ticket.status === "ok") return;
						if (ticket.details?.error === "DeviceNotRegistered") {
							await this.subscriptions.delete({ endpoint: String(chunk[index]?.to) });
							return;
						}
						this.logger.warn(`Expo push failed: ${ticket.message}`);
					}),
				);
			}
		} catch (error) {
			this.logger.warn("Expo push failed.", error instanceof Error ? error.message : error);
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
