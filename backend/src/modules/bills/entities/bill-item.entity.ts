import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DeliverySlot } from '../../deliveries/entities/delivery.entity';

@Entity({ name: 'bill_items' })
export class BillItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  bill_id!: string;

  @Column({ type: 'date' })
  delivery_date!: string;

  @Column({ type: 'varchar', length: 16 })
  slot!: DeliverySlot;

  @Column({ type: 'uuid', nullable: true })
  product_id?: string | null;

  @Column({ type: 'numeric', precision: 8, scale: 3 })
  quantity!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unit_rate!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  line_total!: number;
}
