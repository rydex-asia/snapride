import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { DispatchModule } from '../dispatch/dispatch.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DispatchModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
