import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseAuthService } from '../supabase/supabase-auth.service';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Missing access token');

    (request as Request & { user: AuthUser }).user =
      await this.auth.verifyAccessToken(token);
    return true;
  }
}
