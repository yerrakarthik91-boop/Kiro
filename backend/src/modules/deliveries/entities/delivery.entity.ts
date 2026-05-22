import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type DeliverySlot = 'morning' | 'evening';
export type DeliveryStatus =
  | 'pending'
  | 'delivered'
  | 'missed'
  | 'partial'
  | 'extra';

@Entity({ name: 'deliveries' })
@Index(['seller_id', 'delivery_date', 'slot'])
@Index(['customer_id', 'delivery_date'])
@Index(['customer_id', 'delivery_date', 'slot'], { unique: true })
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  seller_id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'uuid', nullable: true })
  product_id?: string | null;

  @Column({ type: 'date' })
  delivery_date!: string;

  @Column({ type: 'varchar', length: 16 })
  slot!: DeliverySlot;

  @Column({ type: 'numeric', precision: 8, scale: 3 })
  expected_quantity!: number;

  @Column({ type: 'numeric', precision: 8, scale: 3, nullable: true })
  delivered_quantity?: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unit_rate!: number;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status!: DeliveryStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'uuid', nullable: true })
  marked_by_user_id?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  marked_at?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
