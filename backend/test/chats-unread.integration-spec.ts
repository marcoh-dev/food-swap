import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { DataSource, IsNull, Not } from "typeorm";

import { AppModule } from "../src/app.module";
import { Listing, ListingType } from "../src/listings/entities/listing.entity";
import { Place } from "../src/places/entities/place.entity";
import { User } from "../src/users/entities/user.entity";

const PASSWORD = "Tomate123!";
const IN_ONE_WEEK = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

describe("Unread chats (integration)", () => {
	let app: INestApplication<App>;
	let dataSource: DataSource;
	let place: Place;
	// Tokens of the listing owner (A), the person who writes (B) and an outsider (C)
	let a: string;
	let b: string;
	let c: string;
	let listing: Listing;

	const api = () => request(app.getHttpServer());

	const register = async (username: string) => {
		const response = await api()
			.post("/auth/register")
			.send({ username, password: PASSWORD })
			.expect(201);
		return (response.body as { access_token: string }).access_token;
	};

	const unreadCount = async (token: string) => {
		const response = await api()
			.get("/chats/unread-count")
			.auth(token, { type: "bearer" })
			.expect(200);
		return (response.body as { count: number }).count;
	};

	// B writes about A's listing; returns the chat id
	const startChat = async () => {
		const response = await api()
			.post("/chats")
			.auth(b, { type: "bearer" })
			.send({ listingId: listing.id, content: "Ist das noch da?" })
			.expect(201);
		return (response.body as { chatId: string }).chatId;
	};

	const reply = (token: string, chatId: string) =>
		api()
			.post(`/chats/${chatId}/messages`)
			.auth(token, { type: "bearer" })
			.send({ content: "Hallo" })
			.expect(201);

	const markRead = (token: string, chatId: string) =>
		api().post(`/chats/${chatId}/read`).auth(token, { type: "bearer" });

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();

		dataSource = app.get(DataSource);
		place = await dataSource
			.getRepository(Place)
			.findOneOrFail({ where: { postalCode: Not(IsNull()) } });
	});

	beforeEach(async () => {
		await dataSource.query('TRUNCATE "messages", "chats", "listings", "users" CASCADE');
		a = await register("user_a");
		b = await register("user_b");
		c = await register("user_c");

		const listings = dataSource.getRepository(Listing);
		listing = await listings.save(
			listings.create({
				title: "Tomaten",
				description: "Aus dem Garten",
				type: ListingType.GIVEAWAY,
				owner: await dataSource.getRepository(User).findOneByOrFail({ username: "user_a" }),
				placeId: place.id,
				endDate: IN_ONE_WEEK,
			}),
		);
	});

	afterAll(async () => {
		await app.close();
	});

	it("counts the chat for the recipient, not the sender", async () => {
		// Your own messages never make a chat unread
		await startChat();

		expect(await unreadCount(a)).toBe(1);
		expect(await unreadCount(b)).toBe(0);
	});

	it("counts several messages in one chat once", async () => {
		// We count chats, not messages
		const chatId = await startChat();
		await reply(b, chatId);
		await reply(b, chatId);

		expect(await unreadCount(a)).toBe(1);
	});

	it("marks a chat as read", async () => {
		// Opening a chat calls POST /chats/:id/read
		const chatId = await startChat();

		await markRead(a, chatId).expect(204);

		expect(await unreadCount(a)).toBe(0);
		const response = await api().get("/chats").auth(a, { type: "bearer" }).expect(200);
		expect(response.body as unknown).toEqual([
			expect.objectContaining({ id: chatId, unread: false }),
		]);
	});

	it("does not count a hidden chat until the other person replies", async () => {
		// Hiding removes the chat from A's list; a new message brings it back
		const chatId = await startChat();
		await api().delete(`/chats/${chatId}`).auth(a, { type: "bearer" }).expect(204);

		expect(await unreadCount(a)).toBe(0);

		await reply(b, chatId);

		expect(await unreadCount(a)).toBe(1);
	});

	it("still counts a chat after the other person deleted their account", async () => {
		// The chat stays for A until A opens it
		const chatId = await startChat();
		const me = await api().get("/auth/me").auth(b, { type: "bearer" }).expect(200);
		await api()
			.delete(`/users/${(me.body as { id: string }).id}`)
			.auth(b, { type: "bearer" })
			.expect(204);

		expect(await unreadCount(a)).toBe(1);

		await markRead(a, chatId).expect(204);

		expect(await unreadCount(a)).toBe(0);
	});

	it("does not let others mark a chat as read", async () => {
		// C is not part of the chat, so it looks like it does not exist
		const chatId = await startChat();

		await markRead(c, chatId).expect(404);

		expect(await unreadCount(a)).toBe(1);
	});
});
