import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthUser } from '../../shared/types/auth-user.type';
import { NotificationsService } from './notifications.service';

class RegisterPushTokenDto {
  @IsString() @MaxLength(300) token!: string;
  @IsOptional() @IsString() @MaxLength(30) platform?: string;
}

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.notifications.list(user.sub);
  }

  @Post('push-tokens')
  register(@CurrentUser() user: AuthUser, @Body() dto: RegisterPushTokenDto) {
    return this.notifications.registerToken(user.sub, dto.token, dto.platform);
  }

  @Delete('push-tokens/:token')
  unregister(@CurrentUser() user: AuthUser, @Param('token') token: string) {
    return this.notifications.unregisterToken(user.sub, decodeURIComponent(token));
  }

  @Post(':notificationId/read')
  markRead(@CurrentUser() user: AuthUser, @Param('notificationId') id: string) {
    return this.notifications.markRead(user.sub, id);
  }
}
