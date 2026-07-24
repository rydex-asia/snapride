import { IsIn, IsString, Matches, MaxLength } from 'class-validator';

export const STORAGE_BUCKETS = [
  'avatars',
  'parcel-proofs',
  'support-attachments',
  'product-images',
] as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export class CreateUploadUrlDto {
  @IsIn(STORAGE_BUCKETS)
  bucket!: StorageBucket;

  @IsString()
  @MaxLength(120)
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9._ -]*$/)
  fileName!: string;

  @IsString()
  @Matches(/^(image\/(jpeg|png|webp|heic)|application\/pdf)$/)
  contentType!: string;
}
