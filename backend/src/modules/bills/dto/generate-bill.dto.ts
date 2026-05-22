import { IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateBillDto {
  @ApiProperty() @IsString() customer_id!: string;
  @ApiProperty() @IsDateString() period_start!: string;
  @ApiProperty() @IsDateString() period_end!: string;
}
