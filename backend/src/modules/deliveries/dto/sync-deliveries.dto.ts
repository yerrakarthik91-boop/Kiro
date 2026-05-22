import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MarkDeliveryDto } from './mark-delivery.dto';

class SyncChange extends MarkDeliveryDto {
  @ApiProperty()
  id!: string;
}

export class SyncDeliveriesDto {
  @ApiProperty({ type: [SyncChange] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncChange)
  changes!: SyncChange[];
}
