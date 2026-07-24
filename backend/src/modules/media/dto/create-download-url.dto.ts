import { IsIn, IsString, Matches, MaxLength } from 'class-validator';
import { STORAGE_BUCKETS, StorageBucket } from './create-upload-url.dto';

export class CreateDownloadUrlDto {
  @IsIn(STORAGE_BUCKETS)
  bucket!: StorageBucket;

  @IsString()
  @MaxLength(300)
  @Matches(/^[a-zA-Z0-9/_\-.]+$/)
  path!: string;
}
