import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'sellers' })
export class Seller {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  user_id!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 160 })
  business_name!: string;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gst_number?: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  lat?: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  lng?: number | null;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency!: string;

  @Column({ type: 'varchar', length: 64, default: 'Asia/Kolkata' })
  timezone!: string;

  @Column({ type: 'smallint', default: 1 })
  billing_cycle_day!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  default_milk_rate?: number | null;

  @Column({ type: 'varchar', length: 8, nullable: true, unique: true })
  invite_code?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
