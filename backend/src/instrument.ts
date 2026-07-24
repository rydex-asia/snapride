import 'dotenv/config';
import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN || '';
const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
const configuredTraceRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE);
const tracesSampleRate = Number.isFinite(configuredTraceRate)
  ? Math.min(Math.max(configuredTraceRate, 0), 1)
  : 0.1;

Sentry.init({
  dsn,
  enabled: Boolean(dsn) && process.env.NODE_ENV !== 'test',
  environment,
  release: process.env.SENTRY_RELEASE || undefined,
  sendDefaultPii: false,
  tracesSampleRate,
  beforeSend(event) {
    if (event.user) {
      event.user = event.user.id ? { id: String(event.user.id) } : undefined;
    }

    if (event.request) {
      delete event.request.data;
      delete event.request.cookies;
      delete event.request.query_string;
      if (event.request.url) {
        event.request.url = event.request.url.split('?')[0];
      }
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.Authorization;
        delete event.request.headers.cookie;
        delete event.request.headers.Cookie;
      }
    }

    return event;
  },
});

Sentry.setTags({
  service: 'rydex-platform-api',
  runtime: 'node',
});
