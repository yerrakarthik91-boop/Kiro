import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type BillStatus =
  | 'draft'
  | 'pending'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'void';

@Entity({ name: 'bills' })
@Index(['seller_id', 'status', 'due_date'])
@Index(['customer_id', 'period_end'])
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  bill_number!: string;

  @Column({ type: 'uuid' })
  seller_id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'date' })
  period_start!: string;

  @Column({ type: 'date' })
  period_end!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  tax_amount!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  paid_amount!: number;

  // Generated column in SQL (total_amount - paid_amount)
  @Column({ type: 'numeric', precision: 12, scale: 2, generatedType: 'STORED', asExpression: 'total_amount - paid_amount', insert: false, update: false })
  balance!: number;

  @Column({ type: 'date', nullable: true })
  due_date?: string | null;

  @Column({ type: 'varchar', length: 16, default: 'draft' })
  status!: BillStatus;

  @Column({ type: 'text', nullable: true })
  pdf_url?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  generated_at?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
