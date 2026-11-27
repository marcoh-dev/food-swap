import { Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { Repository } from "typeorm";
import webpush, { WebPushError } from "web-push";

import { PushSubscription, PushSubscriptionType } from "./entities/pushSubscription.entity";
import { CHAT_CHANNEL_ID, PushService } from "./push.service";

// The real WebPushError stays (for instanceof); nothing is sent to a real push service
vi.mock("web-push", async (importOriginal) => {
	const actual = await importOriginal<typeof import("web-push")>();
	const mocked = { ...actual, setVapidDetails: vi.fn(), sendNotification: vi.fn() };
	return { ...mocked, default: mocked };
});

// Nothing is sent to Expo's real push service; each test decides the tickets it answers with
const expoSend = vi.hoisted(() => vi.fn());
vi.mock("expo-server-sdk", () => ({
	Expo: class {
		chunkPushNotifications = (messages: unknown[]) => [messages];
		sendPushNotificationsAsync = expoSend;
	},
}));

const VAPID = {
	VAPID_PUBLIC_KEY: "public",
	VAPID_PRIVATE_KEY: "private",
	VAPID_SUBJECT: "mailto:test@example.com",
};
const MESSAGE = { title: "Neue Nachricht von Tomate", body: "Zucchini: Hallo", chatId: "chat-1" };

const subscription = (id: string): PushSubscription =>
	({
		id,
		type: PushSubscriptionType.WEB,
		endpoint: `https://push.example.com/${id}`,
		p256dh: "key",
		auth: "secret",
	}) as PushSubscription;

const appSubscription = (token: string): PushSubscription =>
	({
		id: token,
		type: PushSubscriptionType.EXPO,
		endpoint: token,
		p256dh: null,
		auth: null,
	}) as PushSubscription;

function createService(env: Record<string, string> = VAPID, saved = [subscription("s1")]) {
	const repository = {
		findBy: vi.fn().mockResolvedValue(saved),
		delete: vi.fn().mockResolvedValue(undefined),
	};
	const config = { get: (key: string) => env[key] } as unknown as ConfigService;
	const service = new PushService(repository as unknown as Repository<PushSubscription>, config);
	return { service, repository };
}

const gone = () => new WebPushError("Gone", 410, {}, "", "https://push.example.com/s1");

describe("PushService.sendToUser", () => {
	beforeEach(() => {
		expoSend.mockReset().mockResolvedValue([{ status: "ok", id: "ticket-1" }]);
		vi.mocked(webpush.sendNotification).mockReset().mockResolvedValue({
			statusCode: 201,
			body: "",
			headers: {},
		});
	});

	it("sends the message to each of the user's browsers", async () => {
		const { service } = createService(VAPID, [subscription("s1"), subscription("s2")]);

		await service.sendToUser("user-1", MESSAGE);

		expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
		expect(webpush.sendNotification).toHaveBeenCalledWith(
			{ endpoint: "https://push.example.com/s1", keys: { p256dh: "key", auth: "secret" } },
			JSON.stringify(MESSAGE),
		);
	});

	it("deletes a subscription the push service no longer knows", async () => {
		vi.mocked(webpush.sendNotification).mockRejectedValue(gone());
		const { service, repository } = createService();

		await service.sendToUser("user-1", MESSAGE);

		expect(repository.delete).toHaveBeenCalledWith({ id: "s1" });
	});

	it("keeps the subscription and doesn't throw on other errors", async () => {
		vi.mocked(webpush.sendNotification).mockRejectedValue(
			new WebPushError("Server error", 500, {}, "", "https://push.example.com/s1"),
		);
		const { service, repository } = createService();

		await expect(service.sendToUser("user-1", MESSAGE)).resolves.toBeUndefined();
		expect(repository.delete).not.toHaveBeenCalled();
	});

	it("doesn't throw when the database fails", async () => {
		vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
		const { service, repository } = createService();
		repository.findBy.mockRejectedValue(new Error("Database down"));

		await expect(service.sendToUser("user-1", MESSAGE)).resolves.toBeUndefined();
	});

	it("sends no web push without VAPID keys, but still to the app", async () => {
		const { service } = createService({}, [
			subscription("s1"),
			appSubscription("ExponentPushToken[a]"),
		]);

		await service.sendToUser("user-1", MESSAGE);

		expect(webpush.sendNotification).not.toHaveBeenCalled();
		expect(expoSend).toHaveBeenCalledTimes(1);
	});

	it("sends the message to the app's devices through Expo, with the chat to open", async () => {
		const { service } = createService(VAPID, [
			subscription("s1"),
			appSubscription("ExponentPushToken[a]"),
		]);

		await service.sendToUser("user-1", MESSAGE);

		expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
		expect(expoSend).toHaveBeenCalledWith([
			{
				to: "ExponentPushToken[a]",
				title: MESSAGE.title,
				body: MESSAGE.body,
				data: { chatId: MESSAGE.chatId },
				channelId: CHAT_CHANNEL_ID,
				priority: "high",
				sound: "default",
			},
		]);
	});

	it("deletes a token Expo reports as no longer registered", async () => {
		expoSend.mockResolvedValue([
			{
				status: "error",
				message: "Not registered",
				details: { error: "DeviceNotRegistered" },
			},
		]);
		const { service, repository } = createService(VAPID, [
			appSubscription("ExponentPushToken[a]"),
		]);

		await service.sendToUser("user-1", MESSAGE);

		expect(repository.delete).toHaveBeenCalledWith({ endpoint: "ExponentPushToken[a]" });
	});

	it("keeps the token and doesn't throw on other Expo errors", async () => {
		vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
		expoSend.mockResolvedValue([
			{
				status: "error",
				message: "Rate exceeded",
				details: { error: "MessageRateExceeded" },
			},
		]);
		const { service, repository } = createService(VAPID, [
			appSubscription("ExponentPushToken[a]"),
		]);

		await expect(service.sendToUser("user-1", MESSAGE)).resolves.toBeUndefined();
		expect(repository.delete).not.toHaveBeenCalled();
	});

	it("still sends web push when Expo is unreachable", async () => {
		vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
		expoSend.mockRejectedValue(new Error("Network error"));
		const { service } = createService(VAPID, [
			subscription("s1"),
			appSubscription("ExponentPushToken[a]"),
		]);

		await expect(service.sendToUser("user-1", MESSAGE)).resolves.toBeUndefined();
		expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
	});
});
