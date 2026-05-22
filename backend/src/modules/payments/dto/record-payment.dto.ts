import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordPaymentDto {
  @ApiProperty() @IsString() customer_id!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bill_id?: string;
  @ApiProperty() @IsNumber() @Min(0.01) amount!: number;

  @ApiProperty({
    enum: [
      'cash',
      'upi',
      'google_pay',
      'phonepe',
      'paytm',
      'debit_card',
      'credit_card',
      'net_banking',
      'bank_transfer',
      'adjustment',
    ],
  })
  @IsIn([
    'cash',
    'upi',
    'google_pay',
    'phonepe',
    'paytm',
    'debit_card',
    'credit_card',
    'net_banking',
    'bank_transfer',
    'adjustment',
  ])
  method!:
    | 'cash'
    | 'upi'
    | 'google_pay'
    | 'phonepe'
    | 'paytm'
    | 'debit_card'
    | 'credit_card'
    | 'net_banking'
    | 'bank_transfer'
    | 'adjustment';

  @ApiProperty({ required: false }) @IsOptional() @IsString() reference?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() paid_at?: string;
}
