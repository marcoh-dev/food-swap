import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { instanceToPlain } from 'class-transformer';
import { Server, Socket } from 'socket.io';
import { MessageResponseDto } from './dtos/messageResponse.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
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

  notifyNewMessage(
    participantIds: Array<string | null>,
    message: MessageResponseDto,
  ) {
    const rooms = participantIds
      .filter((id): id is string => id !== null)
      .map((id) => this.userRoom(id));

    this.server.to(rooms).emit('newMessage', instanceToPlain(message));
  }

  notifyChatRead(userId: string, chatId: string) {
    this.server.to(this.userRoom(userId)).emit('chatRead', { chatId });
  }

  notifyChatRemoved(userId: string, chatId: string) {
    this.server.to(this.userRoom(userId)).emit('chatRemoved', { chatId });
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  private async getUserId(client: Socket): Promise<string | null> {
    try {
      const token: unknown = client.handshake.auth.token;
      if (typeof token !== 'string') return null;

      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      return payload.sub;
    } catch {
      return null;
    }
  }
}
