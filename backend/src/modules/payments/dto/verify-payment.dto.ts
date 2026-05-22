import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty() @IsString() bill_id!: string;
  @ApiProperty() @IsNumber() @Min(0.01) amount!: number;
}
