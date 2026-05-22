import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type NotificationChannel = 'push' | 'sms' | 'whatsapp';

@Entity({ name: 'notifications_log' })
@Index(['user_id', 'sent_at'])
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 40 })
  type!: string;

  @Column({ type: 'varchar', length: 16, default: 'push' })
  channel!: NotificationChannel;

  @Column({ type: 'varchar', length: 120, nullable: true })
  title?: string | null;

  @Column({ type: 'text', nullable: true })
  body?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: false })
  is_read!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'sent_at' })
  sent_at!: Date;
}
