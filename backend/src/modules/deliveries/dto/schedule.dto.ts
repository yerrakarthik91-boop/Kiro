import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PauseScheduleDto {
  @ApiProperty() @IsDateString() from_date!: string;
  @ApiProperty() @IsDateString() to_date!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() reason?: string;
}

export class ExtraRequestDto {
  @ApiProperty() @IsDateString() date!: string;

  @ApiProperty({ enum: ['morning', 'evening'] })
  @IsIn(['morning', 'evening'])
  slot!: 'morning' | 'evening';

  @ApiProperty() @IsNumber() @Min(0.05) quantity!: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() product_id?: string;
}
