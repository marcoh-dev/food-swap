import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { createHash } from "node:crypto";
import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";

import { AppModule } from "../src/app.module";
import { RefreshToken } from "../src/auth/entities/refreshToken.entity";
import { User } from "../src/users/entities/user.entity";

const PASSWORD = "Tomate123!";

type Tokens = { access_token: string; refresh_token: string };

describe("Auth tokens (integration)", () => {
	let app: INestApplication<App>;
	let dataSource: DataSource;

	const api = () => request(app.getHttpServer());

	const register = async (username: string) => {
		const response = await api()
			.post("/auth/register")
			.send({ username, password: PASSWORD })
			.expect(201);
		return response.body as Tokens;
	};

	const storedTokens = () => dataSource.getRepository(RefreshToken).find();

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();

		dataSource = app.get(DataSource);
	});

	beforeEach(async () => {
		await dataSource.query('TRUNCATE "messages", "chats", "listings", "users" CASCADE');
	});

	afterAll(async () => {
		await app.close();
	});

	it("returns an access and a refresh token on registration and login", async () => {
		const registered = await register("user_a");

		const response = await api()
			.post("/auth/login")
			.send({ username: "user_a", password: PASSWORD })
			.expect(201);
		const loggedIn = response.body as Tokens;

		for (const tokens of [registered, loggedIn]) {
			expect(Object.keys(tokens).sort()).toEqual(["access_token", "refresh_token"]);
		}
		// Every login gets its own refresh token, e.g. one per device
		expect(loggedIn.refresh_token).not.toBe(registered.refresh_token);
		expect(await storedTokens()).toHaveLength(2);
	});

	it("stores only a hash of the refresh token", async () => {
		const { refresh_token } = await register("user_a");

		const [stored] = await storedTokens();

		expect(stored?.tokenHash).not.toBe(refresh_token);
		expect(stored?.tokenHash).toBe(createHash("sha256").update(refresh_token).digest("hex"));
	});

	it("deletes expired refresh tokens of the user on the next login", async () => {
		await register("user_a");
		await dataSource.query(
			`UPDATE "refresh_tokens" SET "expiresAt" = now() - interval '1 day'`,
		);

		await api()
			.post("/auth/login")
			.send({ username: "user_a", password: PASSWORD })
			.expect(201);

		const stored = await storedTokens();
		expect(stored).toHaveLength(1);
		expect(stored[0]?.expiresAt.getTime()).toBeGreaterThan(Date.now());
	});

	it("deletes the refresh tokens together with the user", async () => {
		const { access_token } = await register("user_a");
		const user = await dataSource.getRepository(User).findOneByOrFail({ username: "user_a" });

		await api().delete(`/users/${user.id}`).auth(access_token, { type: "bearer" }).expect(204);

		expect(await storedTokens()).toHaveLength(0);
	});
});
