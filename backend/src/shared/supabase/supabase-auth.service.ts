import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PrismaService } from '../database/prisma.service';
import { AuthUser } from '../types/auth-user.type';
import { SupabaseService } from './supabase.service';

@Injectable()
export class SupabaseAuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async verifyAccessToken(token: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.admin.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const profile = await this.resolveProfile(data.user);
    if (!profile.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    return {
      sub: profile.id,
      authUserId: data.user.id,
      role: profile.role,
      phone: profile.phone,
      email: profile.email,
    };
  }

  async resolveProfile(authUser: SupabaseUser) {
    const byAuthId = await this.prisma.user.findUnique({
      where: { authUserId: authUser.id },
    });
    if (byAuthId) return byAuthId;

    const phone = authUser.phone || null;
    const email = authUser.email || null;
    const legacyProfile = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (legacyProfile) {
      return this.prisma.user.update({
        where: { id: legacyProfile.id },
        data: { authUserId: authUser.id },
      });
    }

    return this.prisma.user.create({
      data: {
        authUserId: authUser.id,
        phone,
        email,
        fullName:
          typeof authUser.user_metadata?.full_name === 'string'
            ? authUser.user_metadata.full_name
            : null,
        wallet: { create: {} },
      },
    });
  }
}
