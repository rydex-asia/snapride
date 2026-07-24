import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AuthUser } from '../../shared/types/auth-user.type';
import { DispatchService } from './dispatch.service';
import { DispatchOrderDto } from './dto/dispatch-order.dto';

@ApiTags('dispatch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  @Roles(Role.ADMIN)
  dispatch(@Body() dto: DispatchOrderDto) {
    return this.dispatchService.dispatch(dto);
  }

  @Post(':jobId/accept')
  @Roles(Role.PARTNER)
  accept(@Param('jobId') jobId: string, @CurrentUser() user: AuthUser) {
    return this.dispatchService.accept(jobId, user.sub);
  }
}
