import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupportRequestDto {
  @IsString() @MaxLength(60) category!: string;
  @IsOptional() @IsString() @MaxLength(1000) message?: string;
}
