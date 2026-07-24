import { Injectable } from '@nestjs/common';
import { NotificationChannel, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { RealtimeService } from '../../shared/socket/realtime.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  list(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  registerToken(userId: string, token: string, platform?: string) {
    return this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform, isActive: true },
      create: { userId, token, platform },
    });
  }

  async unregisterToken(userId: string, token: string) {
    await this.prisma.pushToken.updateMany({ where: { userId, token }, data: { isActive: false } });
    return { removed: true };
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
    return { read: true };
  }

  async notify(userId: string, title: string, body: string, metadata: Record<string, unknown> = {}) {
    const notification = await this.prisma.notification.create({
      data: { userId, channel: NotificationChannel.PUSH, title, body, metadata: metadata as Prisma.InputJsonValue },
    });
    this.realtime.emitToUser(userId, 'notification', notification);

    const tokens = await this.prisma.pushToken.findMany({ where: { userId, isActive: true }, select: { token: true } });
    if (tokens.length) {
      const messages = tokens.map(({ token }) => ({ to: token, sound: 'default', channelId: 'orders', title, body, data: metadata }));
      void fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      }).catch(() => undefined);
    }
    return notification;
  }
}
