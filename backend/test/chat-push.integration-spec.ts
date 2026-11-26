import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { DataSource, IsNull, Not } from "typeorm";
import type { MockInstance } from "vitest";

import { AppModule } from "../src/app.module";
import { resetRateLimits } from "./setup/rate-limits";
import { Listing, ListingType } from "../src/listings/entities/listing.entity";
import { Place } from "../src/places/entities/place.entity";
import { PushService } from "../src/push/push.service";
import { User } from "../src/users/entities/user.entity";

const PASSWORD = "Tomate123!";
const IN_ONE_WEEK = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

// Checks who gets a push for a chat message; PushService itself is tested in push.service.spec.ts
describe("Chat pushes (integration)", () => {
	let app: INestApplication<App>;
	let dataSource: DataSource;
	let place: Place;
	let sendToUser: MockInstance<PushService["sendToUser"]>;
	// Tokens and ids of the listing owner (A) and the person who writes (B)
	let a: string;
	let b: string;
	let ownerId: string;
	let writerId: string;
	let listing: Listing;

	const api = () => request(app.getHttpServer());

	const register = async (username: string) => {
		const response = await api()
			.post("/auth/register")
			.send({ username, password: PASSWORD })
			.expect(201);
		return (response.body as { access_token: string }).access_token;
	};

	const userId = async (username: string) =>
		(await dataSource.getRepository(User).findOneByOrFail({ username })).id;

	// The push goes out in the background after the response; wait until it was handed over
	const pushedTo = async (count: number) => {
		await vi.waitFor(() => expect(sendToUser).toHaveBeenCalledTimes(count));
		return sendToUser.mock.calls.map(([id]) => id);
	};

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
		sendToUser = vi.spyOn(app.get(PushService), "sendToUser").mockResolvedValue(undefined);
	});

	beforeEach(async () => {
		resetRateLimits(app);
		sendToUser.mockClear();
		await dataSource.query('TRUNCATE "messages", "chats", "listings", "users" CASCADE');
		a = await register("user_a");
		b = await register("user_b");
		ownerId = await userId("user_a");
		writerId = await userId("user_b");

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

	it("sends a new chat to the listing owner only, with the texts", async () => {
		await api()
			.post("/chats")
			.auth(b, { type: "bearer" })
			.send({ listingId: listing.id, content: "Ist das noch da?" })
			.expect(201);

		expect(await pushedTo(1)).toEqual([ownerId]);
		expect(sendToUser.mock.calls[0]?.[1]).toMatchObject({
			title: "Neue Nachricht von user_b",
			body: "Tomaten: Ist das noch da?",
		});
	});

	it("sends a reply to the other person only", async () => {
		const response = await api()
			.post("/chats")
			.auth(b, { type: "bearer" })
			.send({ listingId: listing.id, content: "Ist das noch da?" })
			.expect(201);
		const { chatId } = response.body as { chatId: string };
		await pushedTo(1);

		await api()
			.post(`/chats/${chatId}/messages`)
			.auth(a, { type: "bearer" })
			.send({ content: "Ja, komm vorbei" })
			.expect(201);

		expect(await pushedTo(2)).toEqual([ownerId, writerId]);
	});
});
