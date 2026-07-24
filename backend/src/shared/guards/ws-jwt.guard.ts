import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { SupabaseAuthService } from '../supabase/supabase-auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly auth: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const rawToken =
      client.handshake.auth?.token ||
      client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!rawToken) throw new UnauthorizedException('Missing socket auth token');
    client.data.user = await this.auth.verifyAccessToken(rawToken);
    return true;
  }
}
