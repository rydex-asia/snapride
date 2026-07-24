import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthUser } from '../../shared/types/auth-user.type';
import { CreateRideDto } from './dto/create-ride.dto';
import { VerifyRideOtpDto } from './dto/verify-ride-otp.dto';
import { RidesService } from './rides.service';

@ApiTags('rides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rides')
export class RidesController {
  constructor(private readonly rides: RidesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRideDto) {
    return this.rides.create(user.sub, dto);
  }

  @Get('active/partner')
  activeForPartner(@CurrentUser() user: AuthUser) {
    return this.rides.findActiveForPartner(user.sub);
  }

  @Get(':rideId')
  findOne(@Param('rideId') rideId: string) {
    return this.rides.findOne(rideId);
  }

  @Post(':rideId/arrive')
  arrive(@Param('rideId') rideId: string) {
    return this.rides.arrive(rideId);
  }

  @Post(':rideId/verify-otp')
  verifyOtp(@Param('rideId') rideId: string, @Body() dto: VerifyRideOtpDto) {
    return this.rides.verifyOtp(rideId, dto);
  }

  @Post(':rideId/complete')
  complete(@Param('rideId') rideId: string) {
    return this.rides.complete(rideId);
  }
}
