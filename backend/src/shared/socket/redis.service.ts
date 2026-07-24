import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly publisher: Redis;
  readonly subscriber: Redis;

  constructor(config: ConfigService) {
    const redisUrl = config.getOrThrow<string>('REDIS_URL');
    this.publisher = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
    this.subscriber = new Redis(redisUrl, { maxRetriesPerRequest: 3 });

    this.publisher.on('error', (error) => this.logger.error(error.message));
    this.subscriber.on('error', (error) => this.logger.error(error.message));
  }

  async publish(channel: string, payload: unknown) {
    await this.publisher.publish(channel, JSON.stringify(payload));
  }

  async onModuleDestroy() {
    await Promise.allSettled([this.publisher.quit(), this.subscriber.quit()]);
  }
}
