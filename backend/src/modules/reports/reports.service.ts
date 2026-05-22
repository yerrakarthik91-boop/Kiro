import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Delivery } from '../deliveries/entities/delivery.entity';
import { Bill } from '../bills/entities/bill.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { SellersService } from '../sellers/sellers.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Delivery) private deliveries: Repository<Delivery>,
    @InjectRepository(Bill) private bills: Repository<Bill>,
    @InjectRepository(Payment) private payments: Repository<Payment>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    private sellers: SellersService,
  ) {}

  /** PRD §10 Daily Report — milk delivered + revenue. */
  async daily(userId: string, date?: string) {
    const seller = await this.sellers.findByUserId(userId);
    const day = date ?? new Date().toISOString().slice(0, 10);

    const rows = await this.deliveries.find({
      where: { seller_id: seller.id, delivery_date: day },
    });
    const delivered = rows.filter(
      (d) => d.status === 'delivered' || d.status === 'partial' || d.status === 'extra',
    );
    const milkLitres = sum(
      delivered.map((d) => num(d.delivered_quantity ?? d.expected_quantity)),
    );
    const revenue = sum(
      delivered.map(
        (d) => num(d.delivered_quantity ?? d.expected_quantity) * num(d.unit_rate),
      ),
    );
    const morning = sum(
      delivered.filter((d) => d.slot === 'morning').map((d) => num(d.delivered_quantity ?? d.expected_quantity)),
    );
    const evening = sum(
      delivered.filter((d) => d.slot === 'evening').map((d) => num(d.delivered_quantity ?? d.expected_quantity)),
    );
    return {
      date: day,
      total_milk: milkLitres,
      morning,
      evening,
      revenue,
      delivered_count: delivered.length,
      missed_count: rows.filter((d) => d.status === 'missed').length,
    };
  }

  /** PRD §10 Monthly Report — billing + revenue summary for a YYYY-MM month. */
  async monthly(userId: string, month?: string) {
    const seller = await this.sellers.findByUserId(userId);
    const m = month ?? new Date().toISOString().slice(0, 7);
    const [year, mo] = m.split('-').map(Number);
    const start = new Date(year, mo - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, mo, 0).toISOString().slice(0, 10);

    const rows = await this.deliveries.find({
      where: {
        seller_id: seller.id,
        delivery_date: Between(start, end) as unknown as string,
      },
    });
    const delivered = rows.filter(
      (d) => d.status === 'delivered' || d.status === 'partial' || d.status === 'extra',
    );
    const milkLitres = sum(
      delivered.map((d) => num(d.delivered_quantity ?? d.expected_quantity)),
    );
    const revenue = sum(
      delivered.map(
        (d) => num(d.delivered_quantity ?? d.expected_quantity) * num(d.unit_rate),
      ),
    );

    const billsRows = await this.bills.find({
      where: {
        seller_id: seller.id,
        period_start: Between(start, end) as unknown as string,
      },
    });
    const billed = sum(billsRows.map((b) => num(b.total_amount)));
    const collected = sum(billsRows.map((b) => num(b.paid_amount)));

    return {
      month: m,
      total_milk: milkLitres,
      revenue_from_deliveries: revenue,
      billed,
      collected,
      pending: billed - collected,
      missed_deliveries: rows.filter((d) => d.status === 'missed').length,
    };
  }

  /** Profit & Loss — daily / weekly / monthly buckets. */
  async profitLoss(
    userId: string,
    range: 'day' | 'week' | 'month' = 'month',
  ) {
    const seller = await this.sellers.findByUserId(userId);
    const today = new Date();
    const start = new Date();
    if (range === 'day') {
      start.setDate(today.getDate() - 7);
    } else if (range === 'week') {
      start.setDate(today.getDate() - 7 * 8);
    } else {
      start.setMonth(today.getMonth() - 6);
    }

    const rows = await this.deliveries.find({
      where: {
        seller_id: seller.id,
        delivery_date: Between(
          start.toISOString().slice(0, 10),
          today.toISOString().slice(0, 10),
        ) as unknown as string,
      },
    });

    const buckets = new Map<string, { milk: number; revenue: number }>();
    for (const d of rows) {
      if (
        !(d.status === 'delivered' || d.status === 'partial' || d.status === 'extra')
      ) continue;
      const key = bucketKey(d.delivery_date, range);
      const cur = buckets.get(key) ?? { milk: 0, revenue: 0 };
      const qty = num(d.delivered_quantity ?? d.expected_quantity);
      cur.milk += qty;
      cur.revenue += qty * num(d.unit_rate);
      buckets.set(key, cur);
    }

    const series = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        bucket: key,
        milk: v.milk,
        revenue: v.revenue,
        // No expenses tracked in v1 — profit == revenue for now.
        profit: v.revenue,
      }));

    return {
      range,
      from: start.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10),
      series,
      totals: {
        milk: sum(series.map((s) => s.milk)),
        revenue: sum(series.map((s) => s.revenue)),
        profit: sum(series.map((s) => s.profit)),
      },
    };
  }

  /** PRD §10 Customer Report — consumption + payment history. */
  async customer(userId: string, customerId: string) {
    const seller = await this.sellers.findByUserId(userId);
    const c = await this.customers.findOne({
      where: { id: customerId, seller_id: seller.id },
    });
    if (!c) throw new NotFoundException();

    const last90 = new Date();
    last90.setDate(last90.getDate() - 90);
    const deliveries = await this.deliveries.find({
      where: {
        customer_id: c.id,
        delivery_date: Between(
          last90.toISOString().slice(0, 10),
          new Date().toISOString().slice(0, 10),
        ) as unknown as string,
      },
      order: { delivery_date: 'DESC' },
    });
    const consumed = sum(
      deliveries
        .filter((d) =>
          ['delivered', 'partial', 'extra'].includes(d.status as string),
        )
        .map((d) => num(d.delivered_quantity ?? d.expected_quantity)),
    );
    const billed = sum(
      (await this.bills.find({ where: { customer_id: c.id } })).map((b) =>
        num(b.total_amount),
      ),
    );
    const paid = sum(
      (
        await this.payments.find({
          where: { customer_id: c.id, status: 'success' },
        })
      ).map((p) => num(p.amount)),
    );
    return {
      customer_id: c.id,
      name: c.name,
      consumption_90d_litres: consumed,
      total_billed: billed,
      total_paid: paid,
      balance: billed - paid,
      delivery_count: deliveries.length,
    };
  }
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v) || 0;
  return 0;
}
function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
function bucketKey(date: string, range: 'day' | 'week' | 'month'): string {
  if (range === 'day') return date;
  const d = new Date(date);
  if (range === 'week') {
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    return start.toISOString().slice(0, 10);
  }
  return date.slice(0, 7); // month
}
