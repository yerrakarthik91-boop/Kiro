import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Cow Milk' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ enum: ['cow', 'buffalo', 'toned', 'custom'], required: false })
  @IsOptional()
  @IsIn(['cow', 'buffalo', 'toned', 'custom'])
  type?: 'cow' | 'buffalo' | 'toned' | 'custom';

  @ApiProperty({ enum: ['liter', 'ml', 'kg', 'piece'], required: false })
  @IsOptional()
  @IsIn(['liter', 'ml', 'kg', 'piece'])
  unit?: 'liter' | 'ml' | 'kg' | 'piece';

  @ApiProperty({ example: 60.0 })
  @IsNumber()
  @Min(0)
  default_rate!: number;
}
