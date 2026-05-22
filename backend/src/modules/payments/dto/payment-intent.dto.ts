import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentIntentDto {
  @ApiProperty() @IsString() bill_id!: string;

  @ApiProperty({ enum: ['upi', 'card', 'net_banking'] })
  @IsIn(['upi', 'card', 'net_banking'])
  method!: 'upi' | 'card' | 'net_banking';

  @ApiProperty({ enum: ['razorpay', 'phonepe', 'cashfree', 'mock'], required: false })
  @IsOptional()
  @IsIn(['razorpay', 'phonepe', 'cashfree', 'mock'])
  gateway?: 'razorpay' | 'phonepe' | 'cashfree' | 'mock';
}
