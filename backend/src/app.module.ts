import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { GroceryModule } from './modules/grocery/grocery.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ParcelModule } from './modules/parcel/parcel.module';
import { PartnersModule } from './modules/partners/partners.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RidesModule } from './modules/rides/rides.module';
import { RoutingModule } from './modules/routing/routing.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { MediaModule } from './modules/media/media.module';
import { validationSchema } from './shared/config/env.validation';
import { DatabaseModule } from './shared/database/database.module';
import { RedisModule } from './shared/socket/redis.module';
import { RealtimeModule } from './shared/socket/realtime.module';
import { SupabaseModule } from './shared/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    SentryModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    SupabaseModule,
    RedisModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    PartnersModule,
    RidesModule,
    RoutingModule,
    ParcelModule,
    GroceryModule,
    DispatchModule,
    TrackingModule,
    PaymentsModule,
    NotificationsModule,
    WalletModule,
    AdminModule,
    MonitoringModule,
    MediaModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
