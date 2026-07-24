# Rydex Platform Backend

Production backend for Rydex ride, parcel, Frezo grocery, partner, payment,
dispatch, notification, and live-tracking flows.

## Stack

- Node.js with NestJS on the Express adapter
- Supabase PostgreSQL through Prisma
- Supabase Auth for access and refresh tokens
- Supabase Storage with private signed upload/download URLs
- Socket.IO with the official Redis adapter
- Render Web Service and Render Key Value

NestJS is retained because it already runs on Express and the repository's
domain modules are implemented and shared across the apps.

## 1. Create the Supabase project

In the Supabase dashboard:

1. Create a production project in the closest supported region.
2. In **Authentication > Providers**, enable email and phone as required.
3. Configure an SMS provider before enabling phone OTP in production.
4. Copy the project URL, publishable key, and service-role key.
5. In **Connect**, copy:
   - the transaction/session pooler URL for `DATABASE_URL`;
   - the direct URL or Supavisor session-mode URL on port `5432` for
     `DIRECT_URL`.

The service-role key is backend-only. Never expose it through an
`EXPO_PUBLIC_*` variable or commit it to source control.

## 2. Configure local environment

```bash
cd backend
cp .env.example .env
```

Fill in all required values:

```dotenv
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
REDIS_URL=redis://localhost:6379
```

For local development, start Redis:

```bash
docker compose up -d redis
```

## 3. Create schema and Storage buckets

```bash
npm ci
npm run prisma:generate
npm run prisma:deploy
```

Run [`supabase/storage.sql`](./supabase/storage.sql) once in the Supabase SQL
editor. It creates:

- private `avatars`;
- private `parcel-proofs`;
- private `support-attachments`;
- public-read `product-images`.

Private objects remain scoped to the authenticated Supabase user folder. The
backend issues short-lived signed URLs from:

- `POST /api/v1/media/upload-url`
- `POST /api/v1/media/download-url`

## 4. Authentication contract

The mobile API contract is unchanged:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

Responses still contain:

```json
{
  "accessToken": "supabase-access-token",
  "refreshToken": "supabase-refresh-token",
  "expiresAt": 1770000000,
  "user": {
    "id": "internal-domain-user-id",
    "authUserId": "supabase-auth-user-id",
    "role": "CUSTOMER"
  }
}
```

The internal user ID remains stable for ride, parcel, grocery, wallet, and
payment relationships. `authUserId` maps it to `auth.users.id`.

Public registration always creates a `CUSTOMER`. Partner, store-owner, and
admin roles must be assigned through a trusted administrative workflow.

Existing users created by the previous bcrypt-based login cannot have their
password hashes imported into Supabase Auth. They must be invited or complete
a password-reset migration before production cutover.

## 5. Seed development data

The seed creates matching Supabase Auth users and domain profiles:

```bash
npm run prisma:seed
```

The seed password is `Password@123`; seed accounts are development-only and
must never be used in production.

## 6. Deploy to Render

The repository-root [`render.yaml`](../render.yaml) provisions:

- a paid Node web service;
- a private Render Key Value instance for Socket.IO fan-out;
- health checking at `/api/v1/health/ready`.

Create a Render Blueprint from the repository and enter every `sync: false`
secret when prompted. Keep the web service and Key Value instance in the same
region. Deploy only after `prisma migrate deploy` succeeds.

After deployment configure the Expo/EAS environments:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://YOUR-SERVICE.onrender.com/api/v1
EXPO_PUBLIC_SOCKET_URL=https://YOUR-SERVICE.onrender.com
```

Socket.IO clients automatically negotiate secure WebSockets over the HTTPS
Render URL. The Redis adapter keeps rooms and broadcasts working when multiple
web-service instances are running.

## 7. Verification

```bash
npm run prisma:generate
npm run build
```

Then verify:

1. `GET /api/v1/health/live` returns `status: ok`.
2. `GET /api/v1/health/ready` reports database and Redis as `ok`.
3. Register, log in, refresh, and authenticated REST requests work.
4. Two clients can join the same Socket.IO order room and receive updates.
5. Signed private uploads cannot be downloaded by another user.
6. Render reconnect behavior is tested during a controlled redeploy.

## Security notes

- Supabase Auth is the only issuer accepted by REST and Socket.IO guards.
- Application roles come from PostgreSQL, not editable user metadata.
- Storage paths are generated server-side and ownership-checked.
- Database, service-role, payment, routing, and Sentry credentials remain
  backend-only.
- CORS must list production web origins. Native apps do not require a wildcard.
