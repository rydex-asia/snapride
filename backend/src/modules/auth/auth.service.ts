import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.phone ? [{ phone: dto.phone }] : []),
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });
    if (existing) throw new ConflictException('User already exists');

    const createPayload = {
      password: dto.password,
      phone_confirm: Boolean(dto.phone),
      email_confirm: Boolean(dto.email),
      user_metadata: { full_name: dto.fullName || '' },
      ...(dto.phone ? { phone: dto.phone } : {}),
      ...(dto.email ? { email: dto.email } : {}),
    };
    const { data, error } =
      await this.supabase.admin.auth.admin.createUser(createPayload);
    if (error || !data.user) {
      if (error?.status === 422) {
        throw new ConflictException('User already exists');
      }
      throw new InternalServerErrorException(
        error?.message || 'Could not create account',
      );
    }

    try {
      await this.prisma.user.create({
        data: {
          authUserId: data.user.id,
          phone: data.user.phone || dto.phone || null,
          email: data.user.email || dto.email || null,
          fullName: dto.fullName,
          role: Role.CUSTOMER,
          wallet: { create: {} },
        },
      });
    } catch (error) {
      await this.supabase.admin.auth.admin.deleteUser(data.user.id);
      throw error;
    }

    return this.signIn(dto);
  }

  async login(dto: LoginDto) {
    return this.signIn(dto);
  }

  async refresh(dto: RefreshTokenDto) {
    const client = this.supabase.createAuthClient();
    const { data, error } = await client.auth.refreshSession({
      refresh_token: dto.refreshToken,
    });
    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const profile = await this.findActiveProfile(data.user.id);
    return this.sessionResponse(data.session, profile);
  }

  private async signIn(dto: LoginDto) {
    const client = this.supabase.createAuthClient();
    const credentials = dto.phone
      ? { phone: dto.phone, password: dto.password }
      : { email: dto.email!, password: dto.password };
    const { data, error } = await client.auth.signInWithPassword(credentials);
    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const profile = await this.findActiveProfile(data.user.id);
    await this.prisma.user.update({
      where: { id: profile.id },
      data: { lastLoginAt: new Date() },
    });
    return this.sessionResponse(data.session, profile);
  }

  private async findActiveProfile(authUserId: string) {
    const profile = await this.prisma.user.findUnique({
      where: { authUserId },
    });
    if (!profile?.isActive) {
      throw new UnauthorizedException('Account is unavailable');
    }
    return profile;
  }

  private sessionResponse(
    session: {
      access_token: string;
      refresh_token: string;
      expires_at?: number;
    },
    user: {
      id: string;
      authUserId: string | null;
      role: Role;
      phone: string | null;
      email: string | null;
    },
  ) {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
      user: {
        id: user.id,
        authUserId: user.authUserId,
        role: user.role,
        phone: user.phone,
        email: user.email,
      },
    };
  }
}
