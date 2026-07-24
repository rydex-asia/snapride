import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateIf } from 'class-validator';

export class LoginDto {
  @ValidateIf((dto: LoginDto) => !dto.email)
  @IsPhoneNumber('IN')
  phone?: string;

  @ValidateIf((dto: LoginDto) => !dto.phone)
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
