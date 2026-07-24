# Production monitoring

Rydex uses Sentry for mobile and backend crash/performance reporting, plus
health endpoints for external uptime checks.

## Mobile/EAS variables

Create these variables in the `preview` and `production` EAS environments:

- `EXPO_PUBLIC_SENTRY_DSN`: mobile Sentry project DSN (plain text)
- `EXPO_PUBLIC_APP_ENV`: `preview` or `production` (plain text)
- `EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`: start with `0.15` in production
- `SENTRY_ORG`: Sentry organization slug (plain text)
- `SENTRY_PROJECT`: Sentry mobile project slug (plain text)
- `SENTRY_AUTH_TOKEN`: source-map upload token (**sensitive**)

The DSN is intentionally included in the app bundle. The auth token must never
use an `EXPO_PUBLIC_` name and must only exist in EAS/CI.

The Expo config plugin uploads native symbols and JavaScript source maps during
EAS builds when the organization, project, and auth token are present.

## Backend variables

Set these in the production service environment:

- `SENTRY_DSN`: backend Sentry project DSN
- `SENTRY_ENVIRONMENT=production`
- `SENTRY_RELEASE`: deployed commit SHA or release identifier
- `SENTRY_TRACES_SAMPLE_RATE=0.1`

The API exposes:

- `GET /api/v1/health/live` for process liveness
- `GET /api/v1/health/ready` for PostgreSQL and Redis readiness

Point the hosting provider's liveness and readiness probes at these endpoints.
Use an external uptime monitor against the readiness endpoint every minute.

## Recommended alerts

- New fatal mobile issue: notify immediately
- Mobile crash-free sessions below 99.5% over 30 minutes
- Backend error rate above 2% for 5 minutes
- Backend p95 request duration above 2 seconds for 10 minutes
- Readiness endpoint failing twice consecutively
- Socket reconnect or live-location stale rate above the normal baseline

## Privacy

Monitoring intentionally excludes raw addresses, coordinates, request bodies,
payment data, access tokens, phone numbers, email addresses, cookies, and
authorization headers. Only the authenticated internal user ID is attached.

## Release verification

1. Run `npm test`.
2. Run `npx expo config --type public` and confirm the Sentry plugin is present.
3. Produce an EAS preview build with the preview monitoring variables.
4. Trigger one controlled JavaScript test error in the preview build.
5. Confirm the event is symbolicated and tagged with app version, environment,
   and current screen.
6. Deploy the backend and verify both health endpoints.
7. Trigger one controlled backend 500 in staging and confirm its stack trace.
