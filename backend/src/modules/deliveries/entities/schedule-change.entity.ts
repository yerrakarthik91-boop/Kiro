import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeliverySlot } from './delivery.entity';

export type ScheduleType = 'pause' | 'vacation' | 'extra_request' | 'resume';

@Entity({ name: 'schedule_changes' })
@Index(['customer_id', 'from_date', 'to_date'])
export class ScheduleChange {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'varchar', length: 16 })
  type!: ScheduleType;

  @Column({ type: 'date', nullable: true })
  from_date?: string | null;

  @Column({ type: 'date', nullable: true })
  to_date?: string | null;

  @Column({ type: 'numeric', precision: 8, scale: 3, nullable: true })
  extra_quantity?: number | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  extra_slot?: DeliverySlot | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @Column({ type: 'varchar', length: 16 })
  created_by_role!: string;

  @Column({ type: 'uuid', nullable: true })
  created_by_user_id?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
