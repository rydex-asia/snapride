import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../shared/database/prisma.service';
import { RedisService } from '../../shared/socket/redis.service';

@ApiTags('monitoring')
@Controller('health')
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('live')
  live() {
    return {
      status: 'ok',
      service: 'rydex-platform-api',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    const [database, redis] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.publisher.ping(),
    ]);

    const checks = {
      database: database.status === 'fulfilled' ? 'ok' : 'unavailable',
      redis: redis.status === 'fulfilled' ? 'ok' : 'unavailable',
    };

    if (checks.database !== 'ok' || checks.redis !== 'ok') {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        checks,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
