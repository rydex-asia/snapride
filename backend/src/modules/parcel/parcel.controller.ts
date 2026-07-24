import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthUser } from '../../shared/types/auth-user.type';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { ParcelService } from './parcel.service';

@ApiTags('parcel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parcel')
export class ParcelController {
  constructor(private readonly parcel: ParcelService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateParcelDto) {
    return this.parcel.create(user.sub, dto);
  }
}
