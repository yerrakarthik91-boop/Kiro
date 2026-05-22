import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpRequestDto {
  @ApiProperty({ example: '+919812345678' })
  @IsString()
  @Matches(/^\+\d{8,15}$/, { message: 'phone must be in E.164 format' })
  phone!: string;
}
