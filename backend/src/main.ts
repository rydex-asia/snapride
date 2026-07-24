import './instrument';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './shared/socket/redis-io.adapter';
import { RedisService } from './shared/socket/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
  const config = app.get(ConfigService);
  app.useWebSocketAdapter(
    new RedisIoAdapter(app, app.get(RedisService), config),
  );
  const apiPrefix = config.getOrThrow<string>('API_PREFIX');

  app.use(helmet());
  const configuredOrigins = config
    .get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: configuredOrigins.length ? configuredOrigins : true,
    credentials: true,
  });
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rydex Platform API')
    .setDescription('Centralized backend for Rydex, Frezo, and shared partner fleet.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(config.get<number>('PORT', 4000), '0.0.0.0');
}

void bootstrap().catch(async (error) => {
  Sentry.captureException(error);
  await Sentry.flush(2_000);
  process.exitCode = 1;
});
