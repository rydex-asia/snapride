import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthUser } from '../../shared/types/auth-user.type';
import { CreateDownloadUrlDto } from './dto/create-download-url.dto';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('upload-url')
  createUploadUrl(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateUploadUrlDto,
  ) {
    return this.media.createUploadUrl(user, dto);
  }

  @Post('download-url')
  createDownloadUrl(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateDownloadUrlDto,
  ) {
    return this.media.createDownloadUrl(user, dto);
  }
}
