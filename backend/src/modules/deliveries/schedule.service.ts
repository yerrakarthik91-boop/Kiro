import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ScheduleChange } from './entities/schedule-change.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Delivery } from './entities/delivery.entity';
import { Buyer } from '../buyers/entities/buyer.entity';

interface PauseDto {
  from_date: string;
  to_date: string;
  reason?: string;
}

interface ExtraRequestDto {
  date: string;
  slot: 'morning' | 'evening';
  quantity: number;
  product_id?: string;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleChange)
    private changes: Repository<ScheduleChange>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    @InjectRepository(Delivery) private deliveries: Repository<Delivery>,
    @InjectRepository(Buyer) private buyers: Repository<Buyer>,
  ) {}

  /**
   * Pause / vacation: records the change AND voids any already-generated
   * deliveries that fall in the range, marking them as 'missed' with a
   * note. Future generation will skip these dates automatically.
   */
  async pause(
    userId: string,
    dto: PauseDto,
    type: 'pause' | 'vacation',
  ): Promise<ScheduleChange> {
    if (dto.to_date < dto.from_date) {
      throw new BadRequestException('to_date must be on or after from_date');
    }
    const customers = await this.linkedCustomers(userId);
    if (!customers.length) {
      throw new NotFoundException(
        'No linked seller; link via invite code first',
      );
    }

    const change = await this.changes.save(
      this.changes.create({
        customer_id: customers[0].id, // simplification: first linked customer
        type,
        from_date: dto.from_date,
        to_date: dto.to_date,
        reason: dto.reason ?? null,
        created_by_role: 'buyer',
        created_by_user_id: userId,
      }),
    );

    // Void overlapping pending deliveries
    for (const c of customers) {
      await this.deliveries
        .createQueryBuilder()
        .update(Delivery)
        .set({
          status: 'missed',
          notes: type === 'vacation' ? 'vacation' : 'paused',
          marked_by_user_id: userId,
          marked_at: () => 'now()',
        })
        .where('customer_id = :id', { id: c.id })
        .andWhere('delivery_date BETWEEN :from AND :to', {
          from: dto.from_date,
          to: dto.to_date,
        })
        .andWhere(`status = 'pending'`)
        .execute();
    }

    return change;
  }

  /** Resume: just record the resume event (informational). */
  async resume(userId: string): Promise<ScheduleChange> {
    const customers = await this.linkedCustomers(userId);
    if (!customers.length) {
      throw new NotFoundException('No linked seller');
    }
    return this.changes.save(
      this.changes.create({
        customer_id: customers[0].id,
        type: 'resume',
        created_by_role: 'buyer',
        created_by_user_id: userId,
      }),
    );
  }

  /**
   * Extra request: records the change AND inserts a new `deliveries` row
   * with status='extra' so the seller can see it in their delivery sheet.
   */
  async extraRequest(
    userId: string,
    dto: ExtraRequestDto,
  ): Promise<{ schedule_change: ScheduleChange; delivery: Delivery }> {
    const customers = await this.linkedCustomers(userId);
    if (!customers.length) {
      throw new NotFoundException('No linked seller');
    }
    const c = customers[0];
    const change = await this.changes.save(
      this.changes.create({
        customer_id: c.id,
        type: 'extra_request',
        from_date: dto.date,
        to_date: dto.date,
        extra_quantity: dto.quantity,
        extra_slot: dto.slot,
        created_by_role: 'buyer',
        created_by_user_id: userId,
      }),
    );

    const rate = Number(c.milk_rate ?? 60);
    const delivery = await this.deliveries.save(
      this.deliveries.create({
        seller_id: c.seller_id,
        customer_id: c.id,
        product_id: dto.product_id ?? c.product_id ?? null,
        delivery_date: dto.date,
        slot: dto.slot,
        expected_quantity: dto.quantity,
        unit_rate: rate,
        status: 'extra',
        notes: 'buyer extra request',
      }),
    );
    return { schedule_change: change, delivery };
  }

  async listForBuyer(userId: string): Promise<ScheduleChange[]> {
    const customers = await this.linkedCustomers(userId);
    if (!customers.length) return [];
    return this.changes
      .createQueryBuilder('s')
      .where('s.customer_id IN (:...ids)', {
        ids: customers.map((c) => c.id),
      })
      .orderBy('s.created_at', 'DESC')
      .getMany();
  }

  /** Returns whether a buyer is currently paused/on vacation. */
  async statusForBuyer(
    userId: string,
  ): Promise<{ active: boolean; until?: string; type?: string }> {
    const customers = await this.linkedCustomers(userId);
    if (!customers.length) return { active: false };
    const today = new Date().toISOString().slice(0, 10);
    const active = await this.changes.findOne({
      where: {
        customer_id: customers[0].id,
        from_date: LessThanOrEqual(today) as unknown as string,
        to_date: MoreThanOrEqual(today) as unknown as string,
      },
      order: { created_at: 'DESC' },
    });
    if (!active) return { active: false };
    if (active.type === 'pause' || active.type === 'vacation') {
      return { active: true, until: active.to_date ?? undefined, type: active.type };
    }
    return { active: false };
  }

  private async linkedCustomers(userId: string): Promise<Customer[]> {
    const buyer = await this.buyers.findOne({ where: { user_id: userId } });
    if (!buyer) return [];
    return this.customers.find({ where: { buyer_id: buyer.id } });
  }
}
