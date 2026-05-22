import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty() @IsString() @MaxLength(120) name!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\+?\d{8,15}$/, { message: 'phone must be digits, optional + prefix' })
  phone!: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() alt_phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;

  @ApiProperty({ enum: ['morning', 'evening', 'both'] })
  @IsIn(['morning', 'evening', 'both'])
  delivery_type!: 'morning' | 'evening' | 'both';

  @ApiProperty() @IsNumber() @Min(0) morning_quantity!: number;
  @ApiProperty() @IsNumber() @Min(0) evening_quantity!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() milk_rate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() product_id?: string;

  @ApiProperty({ enum: ['monthly', 'weekly'], required: false })
  @IsOptional()
  @IsIn(['monthly', 'weekly'])
  billing_cycle?: 'monthly' | 'weekly';

  @ApiProperty({ required: false }) @IsOptional() @IsDateString() billing_start_date?: string;
}
