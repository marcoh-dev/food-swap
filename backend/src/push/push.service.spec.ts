import { Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { Repository } from "typeorm";
import webpush, { WebPushError } from "web-push";

import { PushSubscription, PushSubscriptionType } from "./entities/pushSubscription.entity";
import { PushService } from "./push.service";

// The real WebPushError stays (for instanceof); nothing is sent to a real push service
vi.mock("web-push", async (importOriginal) => {
	const actual = await importOriginal<typeof import("web-push")>();
	const mocked = { ...actual, setVapidDetails: vi.fn(), sendNotification: vi.fn() };
	return { ...mocked, default: mocked };
});

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

	it("sends nothing without VAPID keys", async () => {
		const { service, repository } = createService({});

		await service.sendToUser("user-1", MESSAGE);

		expect(repository.findBy).not.toHaveBeenCalled();
		expect(webpush.sendNotification).not.toHaveBeenCalled();
	});
});
