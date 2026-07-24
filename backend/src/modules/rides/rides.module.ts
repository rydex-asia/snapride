import { Module } from '@nestjs/common';
import { DispatchModule } from '../dispatch/dispatch.module';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';

@Module({
  imports: [DispatchModule],
  controllers: [RidesController],
  providers: [RidesService],
})
export class RidesModule {}
