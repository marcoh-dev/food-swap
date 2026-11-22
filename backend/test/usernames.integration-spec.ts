import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";

import { AppModule } from "../src/app.module";
import { resetRateLimits } from "./setup/rate-limits";
import { UniqueUsernamesRegardlessOfCase1795307050316 } from "../src/migrations/1795307050316-UniqueUsernamesRegardlessOfCase";
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

	it("treats usernames that only differ in case as the same", async () => {
		await register("Tomate").expect(201);

		await register("tomate").expect(409);
		await register("TOMATE").expect(409);
		// Shown as typed at registration
		const user = await dataSource.getRepository(User).findOneByOrFail({ username: "Tomate" });
		expect(user.username).toBe("Tomate");
	});

	it("logs in with the username in any spelling", async () => {
		await register("Tomate").expect(201);

		for (const username of ["Tomate", "tomate", "TOMATE"]) {
			await api().post("/auth/login").send({ username, password: PASSWORD }).expect(201);
		}
	});

	it("doesn't let the database store two usernames that only differ in case", async () => {
		await register("Tomate").expect(201);

		await expect(
			dataSource.query(
				`INSERT INTO "users" ("username", "passwordHash") VALUES ('tomate', 'x')`,
			),
		).rejects.toThrow("IDX_users_username_lower");
	});

	it("adjusts existing accounts that break the rules when the migration runs", async () => {
		const queryRunner = dataSource.createQueryRunner();
		await new UniqueUsernamesRegardlessOfCase1795307050316().down(queryRunner);
		const insert = (username: string, createdAt: string, name: string | null = null) =>
			queryRunner.query(
				`INSERT INTO "users" ("username", "passwordHash", "name", "createdAt") VALUES ($1, 'x', $2, $3)`,
				[username, name, createdAt],
			);
		await insert("Maria", "2026-10-09T10:00:00Z", "FoodSwap Team");
		await insert("maria", "2026-10-09T11:00:00Z");
		await insert("maria_2", "2026-10-09T12:00:00Z");
		await insert("Admin", "2026-10-09T13:00:00Z", "Anna");
		await insert("Anna Maria", "2026-10-09T14:00:00Z");
		const log = jest.spyOn(console, "log").mockImplementation(() => undefined);

		await new UniqueUsernamesRegardlessOfCase1795307050316().up(queryRunner);

		log.mockRestore();
		await queryRunner.release();
		const rows = await dataSource.query<{ username: string; name: string | null }[]>(
			`SELECT "username", "name" FROM "users" ORDER BY "createdAt"`,
		);
		expect(rows).toEqual([
			// The oldest keeps its name; its reserved profile name is removed
			{ username: "Maria", name: null },
			// "maria_2" is taken by another account, so the next free number
			{ username: "maria_3", name: null },
			{ username: "maria_2", name: null },
			{ username: "nutzer_2", name: "Anna" },
			// A space isn't allowed; "Anna_Maria" is still free, so no number needed
			{ username: "Anna_Maria", name: null },
		]);
	});
});
