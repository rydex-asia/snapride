import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { RealtimeService } from './realtime.service';
import { PrismaService } from '../database/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

@WebSocketGateway()
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly realtime: RealtimeService, private readonly prisma: PrismaService) {}

  afterInit(server: Server) {
    this.realtime.bindServer(server);
  }

  handleConnection(socket: Socket) {
    this.logger.log(`socket connected ${socket.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_order')
  async joinOrder(@ConnectedSocket() socket: Socket, @MessageBody() body: { orderType: string; orderId: string }) {
    const user = socket.data.user as { sub: string; role: Role };
    let allowed = user.role === Role.ADMIN;
    if (body.orderType === 'GROCERY') {
      const order = await this.prisma.groceryOrder.findUnique({ where: { id: body.orderId }, include: { partner: true, store: true } });
      allowed = allowed || order?.customerId === user.sub || order?.partner?.userId === user.sub || order?.store.ownerId === user.sub;
    } else if (body.orderType === 'RIDE') {
      const order = await this.prisma.rideOrder.findUnique({ where: { id: body.orderId }, include: { partner: true } });
      allowed = allowed || order?.customerId === user.sub || order?.partner?.userId === user.sub;
    } else if (body.orderType === 'PARCEL') {
      const order = await this.prisma.parcelOrder.findUnique({ where: { id: body.orderId }, include: { partner: true } });
      allowed = allowed || order?.customerId === user.sub || order?.partner?.userId === user.sub;
    }
    if (!allowed) throw new ForbiddenException('You cannot follow this order');
    socket.join(`order:${body.orderType}:${body.orderId}`);
    return { ok: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_partner')
  async joinPartner(@ConnectedSocket() socket: Socket, @MessageBody() body: { partnerId: string }) {
    const user = socket.data.user as { sub: string; role: Role };
    const partner = await this.prisma.partner.findUnique({ where: { id: body.partnerId } });
    if (user.role !== Role.ADMIN && partner?.userId !== user.sub) throw new ForbiddenException('You cannot join this partner room');
    socket.join(`partner:${body.partnerId}`);
    return { ok: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_user')
  joinUser(@ConnectedSocket() socket: Socket, @MessageBody() body: { userId: string }) {
    const user = socket.data.user as { sub: string; role: Role };
    if (user.role !== Role.ADMIN && body.userId !== user.sub) throw new ForbiddenException('You cannot join this user room');
    socket.join(`user:${body.userId}`);
    return { ok: true };
  }
}
