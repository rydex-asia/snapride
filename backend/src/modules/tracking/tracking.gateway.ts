import { UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsJwtGuard } from '../../shared/guards/ws-jwt.guard';
import { PartnersService } from '../partners/partners.service';
import { UpdateLocationDto } from '../partners/dto/update-location.dto';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class TrackingGateway {
  constructor(private readonly partners: PartnersService) {}

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('partner_location_update')
  async partnerLocationUpdate(@ConnectedSocket() socket: Socket, @MessageBody() body: UpdateLocationDto) {
    const user = socket.data.user as { sub: string };
    return this.partners.updateLocation(user.sub, body);
  }
}
