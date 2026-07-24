import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ComputeRouteDto } from './dto/compute-route.dto';
import { RoutingService } from './routing.service';

@ApiTags('routing')
@Controller('routing')
@UseGuards(ThrottlerGuard)
export class RoutingController {
  constructor(private readonly routing: RoutingService) {}

  @Post('route')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  computeRoute(@Body() dto: ComputeRouteDto) {
    return this.routing.computeRoute(dto);
  }
}
