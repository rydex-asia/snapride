import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AuthUser } from '../../shared/types/auth-user.type';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PartnersService } from './partners.service';

@ApiTags('partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARTNER)
@Controller('partners')
export class PartnersController {
  constructor(private readonly partners: PartnersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.partners.getPartnerForUser(user.sub);
  }

  @Post('online')
  goOnline(@CurrentUser() user: AuthUser) {
    return this.partners.goOnline(user.sub);
  }

  @Post('offline')
  goOffline(@CurrentUser() user: AuthUser) {
    return this.partners.goOffline(user.sub);
  }

  @Post('vehicles')
  addVehicle(@CurrentUser() user: AuthUser, @Body() dto: CreateVehicleDto) {
    return this.partners.addVehicle(user.sub, dto);
  }

  @Post('location')
  updateLocation(@CurrentUser() user: AuthUser, @Body() dto: UpdateLocationDto) {
    return this.partners.updateLocation(user.sub, dto);
  }
}
