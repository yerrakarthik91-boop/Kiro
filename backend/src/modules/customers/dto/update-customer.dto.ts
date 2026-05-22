import { PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsOptional()
  @IsIn(['active', 'paused', 'due_payment', 'archived'])
  status?: 'active' | 'paused' | 'due_payment' | 'archived';
}
