import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { instanceToPlain } from "class-transformer";
import { Server, Socket } from "socket.io";

import { MessageResponseDto } from "./dtos/messageResponse.dto";
import type { Payload } from "../auth/login.types";

@WebSocketGateway({
	cors: {
		origin: "*",
	},
})
export class ChatsGateway implements OnGatewayConnection {
	@WebSocketServer()
	server!: Server;

	constructor(private readonly jwtService: JwtService) {}

	async handleConnection(client: Socket) {
		const userId = await this.getUserId(client);

		if (!userId) {
			client.disconnect();
			return;
		}

		await client.join(this.userRoom(userId));
	}

	/**
	 * Creates a ticket for connecting to the chat socket. The browser only gets this ticket,
	 * never the login token, and it's only valid for a minute.
	 */
	createTicket(userId: string) {
		const payload: Payload = { sub: userId, purpose: "socket" };
		return this.jwtService.sign(payload, { expiresIn: "60s" });
	}

	notifyNewMessage(participantIds: Array<string | null>, message: MessageResponseDto) {
		const rooms = participantIds
			.filter((id): id is string => id !== null)
			.map((id) => this.userRoom(id));

		this.server.to(rooms).emit("newMessage", instanceToPlain(message));
	}

	notifyChatRead(userId: string, chatId: string) {
		this.server.to(this.userRoom(userId)).emit("chatRead", { chatId });
	}

	notifyChatRemoved(userId: string, chatId: string) {
		this.server.to(this.userRoom(userId)).emit("chatRemoved", { chatId });
	}

	private userRoom(userId: string) {
		return `user:${userId}`;
	}

	private async getUserId(client: Socket): Promise<string | null> {
		try {
			const ticket: unknown = client.handshake.auth.ticket;
			if (typeof ticket !== "string") return null;

			const payload = await this.jwtService.verifyAsync<Payload>(ticket);
			return payload.purpose === "socket" ? payload.sub : null;
		} catch {
			return null;
		}
	}
}
