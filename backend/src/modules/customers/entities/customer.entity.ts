import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DeliveryType = 'morning' | 'evening' | 'both';
export type CustomerStatus = 'active' | 'paused' | 'due_payment' | 'archived';
export type BillingCycle = 'monthly' | 'weekly';

@Entity({ name: 'customers' })
@Index(['seller_id', 'status'])
@Index(['seller_id', 'phone'], { unique: true })
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  seller_id!: string;

  @Column({ type: 'uuid', nullable: true })
  buyer_id?: string | null;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 15 })
  phone!: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  alt_phone?: string | null;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  lat?: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  lng?: number | null;

  @Column({ type: 'varchar', length: 16, default: 'morning' })
  delivery_type!: DeliveryType;

  @Column({ type: 'numeric', precision: 8, scale: 3, default: 0 })
  morning_quantity!: number;

  @Column({ type: 'numeric', precision: 8, scale: 3, default: 0 })
  evening_quantity!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  milk_rate?: number | null;

  @Column({ type: 'uuid', nullable: true })
  product_id?: string | null;

  @Column({ type: 'varchar', length: 16, default: 'monthly' })
  billing_cycle!: BillingCycle;

  @Column({ type: 'date', nullable: true })
  billing_start_date?: string | null;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: CustomerStatus;

  @Column({ type: 'timestamptz', nullable: true })
  linked_at?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at?: Date | null;
}
