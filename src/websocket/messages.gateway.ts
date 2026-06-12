import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'https://2round.vercel.app',
    ],
    credentials: true,
  },
})
@Injectable()
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map of userId -> Set of socketIds (handles multiple tabs/devices)
  private activeClients = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth or query params
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        console.log(`WebSocket connection rejected: No token found. SId: ${client.id}`);
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify(token as string, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload || !payload.sub) {
        console.log(`WebSocket connection rejected: Invalid payload. SId: ${client.id}`);
        client.disconnect();
        return;
      }

      const userId = payload.sub;

      // Associate socket with userId
      let userSockets = this.activeClients.get(userId);
      if (!userSockets) {
        userSockets = new Set();
        this.activeClients.set(userId, userSockets);
      }
      userSockets.add(client.id);

      // Save userId in client's custom data property
      client.data = { userId };
      
      console.log(`User ${userId} connected via WebSocket with socket ID ${client.id}`);
    } catch (err) {
      console.error('WebSocket Connection authorization error:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId && this.activeClients.has(userId)) {
      const sockets = this.activeClients.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.activeClients.delete(userId);
        }
      }
    }
    console.log(`Client disconnected: socket ID ${client.id}`);
  }

  // Helper method to emit events to a specific user
  sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.activeClients.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }
}
