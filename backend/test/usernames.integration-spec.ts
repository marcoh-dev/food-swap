import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";

import { AppModule } from "../src/app.module";
import { resetRateLimits } from "./setup/rate-limits";
import { User } from "../src/users/entities/user.entity";

const PASSWORD = "Tomate123!";

describe("Usernames (integration)", () => {
	let app: INestApplication<App>;
	let dataSource: DataSource;

	const api = () => request(app.getHttpServer());

	const register = (username: string) =>
		api().post("/auth/register").send({ username, password: PASSWORD });

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();

		dataSource = app.get(DataSource);
	});

	beforeEach(async () => {
		resetRateLimits(app);
		await dataSource.query('TRUNCATE "messages", "chats", "listings", "users" CASCADE');
	});

	afterAll(async () => {
		await app.close();
	});

	it("rejects reserved usernames with the same message as taken ones", async () => {
		for (const username of ["Admin_", "4dm1n", "foodswap_team"]) {
			const response = await register(username).expect(409);
			expect((response.body as { message: string }).message).toBe(
				"Dieser Benutzername ist nicht verfügbar.",
			);
		}

		await register("badminton_fan").expect(201);
	});

	it("rejects a reserved profile name", async () => {
		const response = await register("user_a").expect(201);
		const { access_token } = response.body as { access_token: string };
		const user = await dataSource.getRepository(User).findOneByOrFail({ username: "user_a" });

		await api()
			.patch(`/users/${user.id}`)
			.auth(access_token, { type: "bearer" })
			.send({ name: "FoodSwap Support" })
			.expect(400);
		await api()
			.patch(`/users/${user.id}`)
			.auth(access_token, { type: "bearer" })
			.send({ name: "Anna" })
			.expect(200);
	});
});
