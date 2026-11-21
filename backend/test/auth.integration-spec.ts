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

	const refresh = (refresh_token: string) => api().post("/auth/refresh").send({ refresh_token });

	it("exchanges a refresh token for a new token pair", async () => {
		const { refresh_token } = await register("user_a");

		const response = await refresh(refresh_token).expect(201);
		const renewed = response.body as Tokens;

		expect(renewed.refresh_token).not.toBe(refresh_token);
		await api().get("/auth/me").auth(renewed.access_token, { type: "bearer" }).expect(200);
		await refresh(renewed.refresh_token).expect(201);
	});

	it("keeps a used refresh token working for one more minute only", async () => {
		const { refresh_token } = await register("user_a");
		const tokenHash = createHash("sha256").update(refresh_token).digest("hex");

		await refresh(refresh_token).expect(201);
		await refresh(refresh_token).expect(201);

		const used = await dataSource.getRepository(RefreshToken).findOneByOrFail({ tokenHash });
		expect(used.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + 60 * 1000);

		await dataSource.query(
			`UPDATE "refresh_tokens" SET "expiresAt" = now() - interval '1 second' WHERE "tokenHash" = $1`,
			[tokenHash],
		);
		await refresh(refresh_token).expect(401);
	});

	it("renews for two requests that send the same refresh token at the same time", async () => {
		const { refresh_token } = await register("user_a");

		const responses = await Promise.all([refresh(refresh_token), refresh(refresh_token)]);

		expect(responses.map((response) => response.status)).toEqual([201, 201]);
	});

	it("rejects an expired or unknown refresh token", async () => {
		const { refresh_token } = await register("user_a");
		await dataSource.query(
			`UPDATE "refresh_tokens" SET "expiresAt" = now() - interval '1 day'`,
		);

		await refresh(refresh_token).expect(401);
		await refresh("unknown").expect(401);
	});

	it("makes the refresh token unusable on logout", async () => {
		const { refresh_token } = await register("user_a");

		await api().post("/auth/logout").send({ refresh_token }).expect(204);

		await refresh(refresh_token).expect(401);
	});

	it("deletes the refresh tokens together with the user", async () => {
		const { access_token, refresh_token } = await register("user_a");
		const user = await dataSource.getRepository(User).findOneByOrFail({ username: "user_a" });

		await api().delete(`/users/${user.id}`).auth(access_token, { type: "bearer" }).expect(204);

		expect(await storedTokens()).toHaveLength(0);
		await refresh(refresh_token).expect(401);
	});
});
