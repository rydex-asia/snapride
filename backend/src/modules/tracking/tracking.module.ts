import { Module } from '@nestjs/common';
import { PartnersModule } from '../partners/partners.module';
import { TrackingGateway } from './tracking.gateway';

@Module({
  imports: [PartnersModule],
  providers: [TrackingGateway],
})
export class TrackingModule {}
