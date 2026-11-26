import { INestApplication, Logger } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThrottlerStorage, type ThrottlerStorageService } from "@nestjs/throttler";
import { createHash } from "node:crypto";
import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";

import { AppModule } from "../src/app.module";
import { resetRateLimits } from "./setup/rate-limits";
import { GENERAL_LIMIT, LOGIN_LIMIT, REGISTRATION_LIMIT } from "../src/common/rateLimits";

const PASSWORD = "Tomate123!";

// Some tests send 20+ logins; checking passwords (bcrypt) is slow on CI, so 5 seconds aren't enough
vi.setConfig({ testTimeout: 30_000 });
const SECRET = process.env.INTERNAL_API_SECRET ?? "";

describe("Rate limits (integration)", () => {
	let app: INestApplication<App>;
	let dataSource: DataSource;

	const api = () => request(app.getHttpServer());

	// Pretends the request comes from this IP, forwarded by our Next.js server
	const from = (ip: string, secret = SECRET) => ({
		"X-Client-IP": ip,
		"X-Internal-Secret": secret,
	});

	const login = (ip: string, password = "wrong") =>
		api().post("/auth/login").set(from(ip)).send({ username: "user_a", password });

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
		await api().post("/auth/register").send({ username: "user_a", password: PASSWORD });
		resetRateLimits(app);
	});

	afterAll(async () => {
		await app.close();
	});

	it("blocks logins from an IP after too many attempts, also with the correct password", async () => {
		for (let attempt = 0; attempt < LOGIN_LIMIT.limit; attempt++) {
			await login("203.0.113.7").expect(401);
		}

		await login("203.0.113.7", PASSWORD).expect(429);
		// Other IPs can still log in
		await login("203.0.113.8", PASSWORD).expect(201);
	});

	it("blocks registrations from an IP after the limit", async () => {
		for (let index = 0; index < REGISTRATION_LIMIT.limit; index++) {
			await api()
				.post("/auth/register")
				.set(from("203.0.113.7"))
				.send({ username: `user_${index}`, password: PASSWORD })
				.expect(201);
		}

		await api()
			.post("/auth/register")
			.set(from("203.0.113.7"))
			.send({ username: "one_too_many", password: PASSWORD })
			.expect(429);
	});

	it("blocks an IP after too many requests in general", async () => {
		for (let index = 0; index < GENERAL_LIMIT.limit; index++) {
			await api().get("/").set(from("203.0.113.7")).expect(200);
		}

		await api().get("/").set(from("203.0.113.7")).expect(429);
	});

	it("ignores a forwarded IP without the correct secret", async () => {
		// Changing the fake IP doesn't help: without the secret, all count as the real sender
		for (let attempt = 0; attempt < LOGIN_LIMIT.limit; attempt++) {
			await api()
				.post("/auth/login")
				.set(from(`203.0.113.${attempt}`, "guessed"))
				.send({ username: "user_a", password: "wrong" })
				.expect(401);
		}

		await api()
			.post("/auth/login")
			.set(from("198.51.100.1", "guessed"))
			.send({ username: "user_a", password: PASSWORD })
			.expect(429);
	});

	it("counts IPv6 addresses of the same /64 together", async () => {
		for (let attempt = 0; attempt < LOGIN_LIMIT.limit; attempt++) {
			await login(`2001:db8:1:2::${attempt + 1}`).expect(401);
		}

		await login("2001:db8:1:2:ffff::1", PASSWORD).expect(429);
		await login("2001:db8:1:3::1", PASSWORD).expect(201);
	});

	it("logs a block once per source and time window, without the IP", async () => {
		// An IP no other test uses: the guard remembers which sources it already logged
		const warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
		for (let attempt = 0; attempt < LOGIN_LIMIT.limit; attempt++) {
			await login("203.0.113.99").expect(401);
		}

		await login("203.0.113.99").expect(429);
		await login("203.0.113.99").expect(429);

		expect(warn).toHaveBeenCalledTimes(1);
		const [message] = warn.mock.calls[0] as [string];
		expect(message).toContain("Blocked POST /auth/login");
		expect(message).not.toContain("203.0.113.99");
		warn.mockRestore();
	});

	it("stores neither the IP nor a plain hash of it", async () => {
		await login("203.0.113.7").expect(401);

		const keys = [...app.get<ThrottlerStorageService>(ThrottlerStorage).storage.keys()];
		const plainHash = createHash("sha256")
			.update("AuthController-login-default-203.0.113.7")
			.digest("hex");

		expect(keys.length).toBeGreaterThan(0);
		expect(keys.some((key) => key.includes("203.0.113.7"))).toBe(false);
		expect(keys).not.toContain(plainHash);
	});
});
