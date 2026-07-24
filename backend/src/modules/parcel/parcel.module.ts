import { Module } from '@nestjs/common';
import { DispatchModule } from '../dispatch/dispatch.module';
import { ParcelController } from './parcel.controller';
import { ParcelService } from './parcel.service';

@Module({
  imports: [DispatchModule],
  controllers: [ParcelController],
  providers: [ParcelService],
})
export class ParcelModule {}
