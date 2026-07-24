import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ServerOptions } from 'socket.io';
import { RedisService } from './redis.service';

export class RedisIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const origins = this.config
      .get<string>('CORS_ORIGINS', '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: origins.length ? origins : true,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25_000,
      pingTimeout: 20_000,
    });
    server.adapter(
      createAdapter(this.redis.publisher, this.redis.subscriber, {
        requestsTimeout: 5_000,
      }),
    );
    return server;
  }
}
