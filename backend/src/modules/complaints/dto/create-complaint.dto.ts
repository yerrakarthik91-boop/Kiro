import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiProperty({ enum: ['delivery', 'billing', 'quantity', 'other'] })
  @IsIn(['delivery', 'billing', 'quantity', 'other'])
  category!: 'delivery' | 'billing' | 'quantity' | 'other';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() photo_url?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() delivery_id?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bill_id?: string;
}
