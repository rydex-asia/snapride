import { IsString, Length } from 'class-validator';

export class VerifyRideOtpDto {
  @IsString()
  @Length(4, 6)
  otp!: string;
}
