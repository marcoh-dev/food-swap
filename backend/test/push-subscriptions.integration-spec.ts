import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";

import { AppModule } from "../src/app.module";
import { resetRateLimits } from "./setup/rate-limits";
import { PushSubscription } from "../src/push/entities/pushSubscription.entity";

const PASSWORD = "Tomate123!";
const ENDPOINT = "https://fcm.googleapis.com/fcm/send/abc123";

const webSubscription = (endpoint = ENDPOINT) => ({
	type: "web",
	endpoint,
	keys: {
		p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u",
		auth: "tBHItJI5svbpez7KI4CCXg",
	},
});

describe("Push subscriptions (integration)", () => {
	let app: INestApplication<App>;
	let dataSource: DataSource;
	let a: string;
	let b: string;

	const api = () => request(app.getHttpServer());

	const register = async (username: string) => {
		const response = await api()
			.post("/auth/register")
			.send({ username, password: PASSWORD })
			.expect(201);
		return (response.body as { access_token: string }).access_token;
	};

	const subscribe = (token: string, body: unknown = webSubscription()) =>
		api()
			.post("/push-subscriptions")
			.auth(token, { type: "bearer" })
			.send(body as object);

	const unsubscribe = (token: string, endpoint = ENDPOINT) =>
		api().delete("/push-subscriptions").auth(token, { type: "bearer" }).send({ endpoint });

	const subscriptions = () => dataSource.getRepository(PushSubscription).find();

	// The only saved subscription; fails the test if there are none or several
	const onlySubscription = async () => {
		const all = await subscriptions();
		const [subscription] = all;
		if (all.length !== 1 || !subscription)
			throw new Error(`Expected 1 subscription, got ${all.length}`);
		return subscription;
	};

	const userId = async (token: string) => {
		const response = await api().get("/auth/me").auth(token, { type: "bearer" }).expect(200);
		return (response.body as { id: string }).id;
	};

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		// The same validation as in main.ts, so invalid subscriptions are rejected like in production
		app.useGlobalPipes(
			new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
		);
		await app.init();

		dataSource = app.get(DataSource);
	});

	beforeEach(async () => {
		resetRateLimits(app);
		await dataSource.query('TRUNCATE "messages", "chats", "listings", "users" CASCADE');
		a = await register("tomate_a");
		b = await register("tomate_b");
	});

	afterAll(async () => {
		await app.close();
	});

	it("saves a browser's subscription for the logged-in user", async () => {
		await subscribe(a).expect(204);

		expect(await onlySubscription()).toMatchObject({
			type: "web",
			endpoint: ENDPOINT,
			p256dh: webSubscription().keys.p256dh,
			auth: webSubscription().keys.auth,
		});
	});

	it("renews an existing subscription instead of adding a second one", async () => {
		await subscribe(a).expect(204);
		const first = await onlySubscription();

		await subscribe(a).expect(204);
		const renewed = await onlySubscription();

		expect(renewed.lastSeenAt.getTime()).toBeGreaterThanOrEqual(first.lastSeenAt.getTime());
		expect(renewed.createdAt).toEqual(first.createdAt);
	});

	it("moves the subscription to another account that logs in on the same browser", async () => {
		await subscribe(a).expect(204);
		await subscribe(b).expect(204);

		expect((await onlySubscription()).userId).toBe(await userId(b));
	});

	it("deletes only the user's own subscription", async () => {
		await subscribe(a).expect(204);

		await unsubscribe(b).expect(204);
		expect(await subscriptions()).toHaveLength(1);

		await unsubscribe(a).expect(204);
		expect(await subscriptions()).toHaveLength(0);
	});

	it("rejects invalid subscriptions", async () => {
		await subscribe(a, { ...webSubscription(), endpoint: "http://example.com/push" }).expect(
			400,
		);
		await subscribe(a, { ...webSubscription(), keys: { p256dh: "" } }).expect(400);
		await subscribe(a, { ...webSubscription(), type: "expo" }).expect(400);
		expect(await subscriptions()).toHaveLength(0);
	});

	it("deletes all of the user's subscriptions on \"Überall abmelden\", but not others'", async () => {
		await subscribe(a, webSubscription("https://fcm.googleapis.com/fcm/send/laptop")).expect(
			204,
		);
		await subscribe(a, webSubscription("https://fcm.googleapis.com/fcm/send/phone")).expect(
			204,
		);
		await subscribe(b, webSubscription("https://fcm.googleapis.com/fcm/send/other")).expect(
			204,
		);

		await api().post("/auth/logout-all").auth(a, { type: "bearer" }).expect(204);

		expect((await onlySubscription()).userId).toBe(await userId(b));
	});

	it("needs a login", async () => {
		await api().post("/push-subscriptions").send(webSubscription()).expect(401);
		await api().delete("/push-subscriptions").send({ endpoint: ENDPOINT }).expect(401);
	});

	it("deletes the subscriptions with the account", async () => {
		await subscribe(a).expect(204);
		await api()
			.delete(`/users/${await userId(a)}`)
			.auth(a, { type: "bearer" })
			.expect(204);

		expect(await subscriptions()).toHaveLength(0);
	});
});
