import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpVerifyDto {
  @ApiProperty({ example: '+919812345678' })
  @IsString()
  @Matches(/^\+\d{8,15}$/)
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(4, 6)
  otp!: string;

  @ApiProperty({
    example: 'seller',
    required: false,
    description:
      'Required only on first-time sign-up. Determines whether to create a Seller or Buyer account.',
  })
  @IsOptional()
  @IsIn(['seller', 'buyer'])
  role?: 'seller' | 'buyer';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
