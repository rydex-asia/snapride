import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional()
  @ValidateIf((dto: RegisterDto) => !dto.email)
  @IsPhoneNumber('IN')
  phone?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto: RegisterDto) => !dto.phone)
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
