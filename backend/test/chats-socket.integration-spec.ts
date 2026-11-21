import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import type { Socket } from "socket.io";
import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";

import { AppModule } from "../src/app.module";
import { ChatsGateway } from "../src/chats/chats.gateway";
import { User } from "../src/users/entities/user.entity";

const PASSWORD = "Tomate123!";

describe("Chat socket tickets (integration)", () => {
	let app: INestApplication<App>;
	let dataSource: DataSource;
	let accessToken: string;
	let userId: string;

	const api = () => request(app.getHttpServer());

	const createTicket = async () => {
		const response = await api()
			.post("/chats/socket-ticket")
			.auth(accessToken, { type: "bearer" })
			.expect(201);
		return (response.body as { ticket: string }).ticket;
	};

	// Connects a fake socket client with the given handshake data; returns whether it joined its room
	const connect = async (auth: Record<string, unknown>) => {
		const join = jest.fn();
		const disconnect = jest.fn();
		const client = { handshake: { auth }, join, disconnect } as unknown as Socket;

		await app.get(ChatsGateway).handleConnection(client);

		expect(join.mock.calls.length + disconnect.mock.calls.length).toBe(1);
		return join.mock.calls.length === 1;
	};

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
		const response = await api()
			.post("/auth/register")
			.send({ username: "user_a", password: PASSWORD })
			.expect(201);
		accessToken = (response.body as { access_token: string }).access_token;
		userId = (await dataSource.getRepository(User).findOneByOrFail({ username: "user_a" })).id;
	});

	afterAll(async () => {
		await app.close();
	});

	it("connects with a ticket", async () => {
		expect(await connect({ ticket: await createTicket() })).toBe(true);
	});

	it("doesn't connect with an access token, an expired ticket or nothing", async () => {
		const expired = app
			.get(JwtService)
			.sign({ sub: userId, purpose: "socket" }, { expiresIn: -10 });

		expect(await connect({ ticket: accessToken })).toBe(false);
		expect(await connect({ token: accessToken })).toBe(false);
		expect(await connect({ ticket: expired })).toBe(false);
		expect(await connect({})).toBe(false);
	});

	it("doesn't accept a ticket as an access token", async () => {
		const ticket = await createTicket();

		await api().get("/auth/me").auth(ticket, { type: "bearer" }).expect(401);
	});

	it("only gives tickets to logged-in users", async () => {
		await api().post("/chats/socket-ticket").expect(401);
	});
});
