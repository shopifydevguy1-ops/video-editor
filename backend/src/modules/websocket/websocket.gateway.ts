import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/render',
})
export class RenderProgressGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RenderProgressGateway.name);
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;

  constructor(jwtService: JwtService, configService: ConfigService) {
    this.jwtService = jwtService;
    this.configService = configService;
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Client connected without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.userId = payload.userId;
      this.logger.log(`Client connected: ${client.id} (User: ${payload.userId})`);
    } catch (error) {
      this.logger.warn(`Invalid token for client ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-render')
  handleSubscribeRender(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { renderId: string },
  ) {
    const { renderId } = data;
    client.join(`render:${renderId}`);
    this.logger.log(`Client ${client.id} subscribed to render ${renderId}`);
  }

  @SubscribeMessage('unsubscribe-render')
  handleUnsubscribeRender(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { renderId: string },
  ) {
    const { renderId } = data;
    client.leave(`render:${renderId}`);
    this.logger.log(`Client ${client.id} unsubscribed from render ${renderId}`);
  }

  // Method to emit progress updates (called from render service)
  emitProgress(renderId: string, progress: number) {
    this.server.to(`render:${renderId}`).emit('render:progress', {
      renderId,
      progress,
      timestamp: new Date().toISOString(),
    });
  }

  emitComplete(renderId: string, outputUrl: string) {
    this.server.to(`render:${renderId}`).emit('render:complete', {
      renderId,
      outputUrl,
      timestamp: new Date().toISOString(),
    });
  }

  emitError(renderId: string, error: string) {
    this.server.to(`render:${renderId}`).emit('render:error', {
      renderId,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}

