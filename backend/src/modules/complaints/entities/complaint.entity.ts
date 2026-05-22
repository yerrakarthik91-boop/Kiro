import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ComplaintCategory =
  | 'delivery'
  | 'billing'
  | 'quantity'
  | 'other';
export type ComplaintStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

@Entity({ name: 'complaints' })
@Index(['seller_id', 'status', 'created_at'])
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'uuid' })
  seller_id!: string;

  @Column({ type: 'varchar', length: 16 })
  category!: ComplaintCategory;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  photo_url?: string | null;

  @Column({ type: 'uuid', nullable: true })
  delivery_id?: string | null;

  @Column({ type: 'uuid', nullable: true })
  bill_id?: string | null;

  @Column({ type: 'varchar', length: 16, default: 'open' })
  status!: ComplaintStatus;

  @Column({ type: 'text', nullable: true })
  resolution_note?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolved_at?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
