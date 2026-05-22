import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkDeliveryDto {
  @ApiProperty({ enum: ['delivered', 'missed', 'partial'] })
  @IsIn(['delivered', 'missed', 'partial'])
  status!: 'delivered' | 'missed' | 'partial';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  delivered_quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
