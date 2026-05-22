import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSellerDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() business_name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() gst_number?: string;
  @ApiProperty({ required: false, minimum: 1, maximum: 28 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  billing_cycle_day?: number;
  @ApiProperty({ required: false }) @IsOptional() default_milk_rate?: number;
}
