# Rydex Platform Backend Architecture

## Principle

Rydex, Frezo, and the partner app are separate frontends on top of one centralized modular monolith:

- One PostgreSQL database
- One partner fleet
- One dispatch engine
- One realtime tracking engine
- One auth and role model

## Module Order

1. `shared/config`, `shared/database`, `shared/socket`
2. `auth`, `users`
3. `partners`
4. `dispatch`
5. `rides`, `parcel`, `grocery`
6. `tracking`
7. `payments`, `wallet`, `notifications`, `admin`

## Request Flow

Ride example:

1. Customer calls `POST /api/v1/rides`
2. `RidesService` creates `RideOrder`
3. `DispatchService` receives `{ sourceApp, orderType, orderId }`
4. Dispatch checks vehicle compatibility and nearest available partner
5. Partner gets `order_assigned` over Socket.IO
6. Customer order room receives `order_assigned`
7. Partner accepts, then location updates stream through `partner_location_update`
8. Ride OTP changes status to `STARTED`
9. Completion clears partner active order and returns partner online

Parcel and grocery use the same dispatch path.

## Socket Events

- `partner_location_update`
- `order_created`
- `order_assigned`
- `order_accepted`
- `ride_started`
- `ride_completed`
- `grocery_status_update`
- `parcel_status_update`

## Database Notes

Every operational order has:

- `sourceApp`
- order type table (`RideOrder`, `ParcelOrder`, `GroceryOrder`)
- dispatch jobs in `DispatchJob`
- optional partner assignment
- payment relationship

Partner availability lives in `Partner.status`, `activeOrderId`, and `activeOrderType`.

## Deployment

Use Supabase PostgreSQL and Redis Cloud by setting:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Railway can use `Procfile`. Render can use `render.yaml`.
