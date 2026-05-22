import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateComplaintDto {
  @ApiProperty({ enum: ['open', 'in_progress', 'resolved', 'rejected'] })
  @IsIn(['open', 'in_progress', 'resolved', 'rejected'])
  status!: 'open' | 'in_progress' | 'resolved' | 'rejected';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resolution_note?: string;
}
