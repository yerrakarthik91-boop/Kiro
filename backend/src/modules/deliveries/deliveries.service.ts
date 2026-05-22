import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliverySlot } from './entities/delivery.entity';
import { MarkDeliveryDto } from './dto/mark-delivery.dto';
import { SyncDeliveriesDto } from './dto/sync-deliveries.dto';
import { SellersService } from '../sellers/sellers.service';
import { BuyersService } from '../buyers/buyers.service';
import { Customer } from '../customers/entities/customer.entity';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery) private deliveries: Repository<Delivery>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    private sellers: SellersService,
    private buyers: BuyersService,
  ) {}

  async list(
    userId: string,
    q: { date: string; slot?: DeliverySlot },
  ): Promise<Array<Delivery & { customer_name: string }>> {
    const seller = await this.sellers.findByUserId(userId);
    const where: Record<string, unknown> = {
      seller_id: seller.id,
      delivery_date: q.date,
    };
    if (q.slot) where.slot = q.slot;

    const rows = await this.deliveries.find({
      where,
      order: { created_at: 'ASC' },
    });
    if (rows.length === 0) return [];

    const customerMap = new Map(
      (
        await this.customers.find({
          where: rows.map((r) => ({ id: r.customer_id })),
        })
      ).map((c) => [c.id, c.name]),
    );
    return rows.map((d) => ({
      ...d,
      customer_name: customerMap.get(d.customer_id) ?? '?',
    }));
  }

  async mark(userId: string, id: string, dto: MarkDeliveryDto): Promise<Delivery> {
    const seller = await this.sellers.findByUserId(userId);
    const d = await this.deliveries.findOne({
      where: { id, seller_id: seller.id },
    });
    if (!d) throw new NotFoundException('Delivery not found');

    d.status = dto.status;
    if (dto.status === 'delivered') {
      d.delivered_quantity = dto.delivered_quantity ?? d.expected_quantity;
    } else if (dto.status === 'partial') {
      d.delivered_quantity = dto.delivered_quantity ?? 0;
    } else if (dto.status === 'missed') {
      d.delivered_quantity = 0;
    }
    if (dto.notes !== undefined) d.notes = dto.notes;
    d.marked_at = new Date();
    d.marked_by_user_id = userId;
    return this.deliveries.save(d);
  }

  async sync(userId: string, dto: SyncDeliveriesDto) {
    const results: Array<{ id: string; result: 'accepted' | 'rejected' }> = [];
    for (const change of dto.changes) {
      try {
        await this.mark(userId, change.id, {
          status: change.status,
          delivered_quantity: change.delivered_quantity,
          notes: change.notes,
        });
        results.push({ id: change.id, result: 'accepted' });
      } catch {
        results.push({ id: change.id, result: 'rejected' });
      }
    }
    return { results };
  }

  /** BU-02 Buyer delivery history. */
  async listForBuyer(
    userId: string,
    q: { from?: string; to?: string },
  ): Promise<Delivery[]> {
    const buyer = await this.buyers.getOrCreateForUser(userId);
    const customers = await this.customers.find({ where: { buyer_id: buyer.id } });
    if (!customers.length) return [];
    const ids = customers.map((c) => c.id);
    const qb = this.deliveries
      .createQueryBuilder('d')
      .where('d.customer_id IN (:...ids)', { ids });
    if (q.from) qb.andWhere('d.delivery_date >= :from', { from: q.from });
    if (q.to) qb.andWhere('d.delivery_date <= :to', { to: q.to });
    qb.orderBy('d.delivery_date', 'DESC').addOrderBy('d.slot', 'ASC');
    return qb.getMany();
  }

  /** BU-03 Calendar map for a month: returns one entry per delivered date. */
  async calendarForBuyer(
    userId: string,
    month: string, // YYYY-MM
  ): Promise<Array<{ date: string; status: 'morning' | 'evening' | 'both' | 'missed' }>> {
    const [year, m] = month.split('-').map(Number);
    const start = `${year}-${String(m).padStart(2, '0')}-01`;
    const end = `${year}-${String(m).padStart(2, '0')}-${String(
      new Date(year, m, 0).getDate(),
    ).padStart(2, '0')}`;
    const rows = await this.listForBuyer(userId, { from: start, to: end });
    const byDate = new Map<string, { morning?: string; evening?: string }>();
    for (const r of rows) {
      const cur = byDate.get(r.delivery_date) ?? {};
      cur[r.slot] = r.status;
      byDate.set(r.delivery_date, cur);
    }
    return Array.from(byDate.entries()).map(([date, slots]) => {
      const m = slots.morning;
      const e = slots.evening;
      const isDelivered = (s?: string) =>
        s === 'delivered' || s === 'partial' || s === 'extra';
      let status: 'morning' | 'evening' | 'both' | 'missed';
      if (isDelivered(m) && isDelivered(e)) status = 'both';
      else if (isDelivered(m)) status = 'morning';
      else if (isDelivered(e)) status = 'evening';
      else status = 'missed';
      return { date, status };
    });
  }
}
