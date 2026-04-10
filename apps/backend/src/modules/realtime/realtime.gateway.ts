import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = `${client.handshake.auth.token || ""}`;
    if (!token) return client.disconnect();
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  emitNotificationsChanged(userId: string) {
    this.server.to(`user:${userId}`).emit("notifications:changed", {});
  }
}
