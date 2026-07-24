import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { AuthUser } from '../../shared/types/auth-user.type';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateDownloadUrlDto } from './dto/create-download-url.dto';
import {
  CreateUploadUrlDto,
  StorageBucket,
} from './dto/create-upload-url.dto';

@Injectable()
export class MediaService {
  constructor(private readonly supabase: SupabaseService) {}

  async createUploadUrl(user: AuthUser, dto: CreateUploadUrlDto) {
    this.assertBucketAccess(user, dto.bucket);
    const extension = extname(dto.fileName).toLowerCase();
    const path = `${user.authUserId}/${randomUUID()}${extension}`;
    const { data, error } = await this.supabase.admin.storage
      .from(dto.bucket)
      .createSignedUploadUrl(path, { upsert: false });

    if (error || !data) {
      throw new BadRequestException(error?.message || 'Upload URL unavailable');
    }
    return {
      bucket: dto.bucket,
      path,
      contentType: dto.contentType,
      token: data.token,
      signedUrl: data.signedUrl,
    };
  }

  async createDownloadUrl(user: AuthUser, dto: CreateDownloadUrlDto) {
    this.assertBucketAccess(user, dto.bucket);
    const ownerId = dto.path.split('/')[0];
    const elevated =
      user.role === Role.ADMIN ||
      (dto.bucket === 'product-images' && user.role === Role.STORE_OWNER);
    if (!elevated && ownerId !== user.authUserId) {
      throw new ForbiddenException('You cannot access this object');
    }

    const { data, error } = await this.supabase.admin.storage
      .from(dto.bucket)
      .createSignedUrl(dto.path, 300);
    if (error || !data) {
      throw new BadRequestException(error?.message || 'File URL unavailable');
    }
    return { ...data, expiresIn: 300 };
  }

  private assertBucketAccess(user: AuthUser, bucket: StorageBucket) {
    if (
      bucket === 'product-images' &&
      user.role !== Role.ADMIN &&
      user.role !== Role.STORE_OWNER
    ) {
      throw new ForbiddenException('Only store owners can manage product images');
    }
  }
}
