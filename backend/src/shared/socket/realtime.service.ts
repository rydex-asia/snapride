import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { RedisService } from './redis.service';

@Injectable()
export class RealtimeService {
  private server?: Server;

  constructor(private readonly redis: RedisService) {}

  bindServer(server: Server) {
    this.server = server;
  }

  emitToOrder(orderType: string, orderId: string, event: string, payload: unknown) {
    this.server?.to(`order:${orderType}:${orderId}`).emit(event, payload);
  }

  emitToPartner(partnerId: string, event: string, payload: unknown) {
    this.server?.to(`partner:${partnerId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }

  async broadcastFleetEvent(event: string, payload: unknown) {
    this.server?.emit(event, payload);
    await this.redis.publish('fleet.events', { event, payload });
  }
}
