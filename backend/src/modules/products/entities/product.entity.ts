import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ProductType = 'cow' | 'buffalo' | 'toned' | 'custom';
export type ProductUnit = 'liter' | 'ml' | 'kg' | 'piece';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  seller_id?: string | null;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ type: 'varchar', length: 16, default: 'cow' })
  type!: ProductType;

  @Column({ type: 'varchar', length: 16, default: 'liter' })
  unit!: ProductUnit;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  default_rate!: number;

  @Column({ type: 'text', nullable: true })
  image_url?: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
