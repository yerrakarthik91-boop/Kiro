import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'google_pay'
  | 'phonepe'
  | 'paytm'
  | 'debit_card'
  | 'credit_card'
  | 'net_banking'
  | 'bank_transfer'
  | 'adjustment';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

@Entity({ name: 'payments' })
@Index(['seller_id', 'paid_at'])
@Index(['bill_id'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  seller_id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'uuid', nullable: true })
  bill_id?: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 32 })
  method!: PaymentMethod;

  @Column({ type: 'varchar', length: 80, nullable: true })
  reference?: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  gateway?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  gateway_order_id?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  gateway_payment_id?: string | null;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status!: PaymentStatus;

  @Column({ type: 'uuid', nullable: true })
  recorded_by_user_id?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
