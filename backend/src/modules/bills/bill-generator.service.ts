import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { BillItem } from './entities/bill-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Delivery } from '../deliveries/entities/delivery.entity';
import { Seller } from '../sellers/entities/seller.entity';

/**
 * Auto bill generation. Runs daily at 06:00 — checks every seller and, if
 * today is their billing_cycle_day, generates monthly bills for the period
 * that just closed. Idempotent (skips if a bill already exists for the
 * same period+customer).
 */
@Injectable()
export class BillGeneratorService {
  private readonly logger = new Logger(BillGeneratorService.name);

  constructor(
    @InjectRepository(Bill) private bills: Repository<Bill>,
    @InjectRepository(BillItem) private items: Repository<BillItem>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    @InjectRepository(Delivery) private deliveries: Repository<Delivery>,
    @InjectRepository(Seller) private sellers: Repository<Seller>,
    private ds: DataSource,
  ) {}

  @Cron('0 6 * * *')
  async runDaily() {
    const today = new Date();
    const day = today.getDate();
    const sellers = await this.sellers.find();
    let total = 0;
    for (const s of sellers) {
      if (s.billing_cycle_day !== day) continue;
      total += await this.generateForSeller(s.id, today);
    }
    if (total) this.logger.log(`Auto-generated ${total} bills`);
  }

  /** Manual trigger from the controller — bills the previous full month. */
  async generateNow(sellerUserId: string) {
    const seller = await this.sellers.findOne({
      where: { user_id: sellerUserId },
    });
    if (!seller) return { created: 0 };
    return this.generateForSeller(seller.id, new Date()).then((created) => ({
      created,
    }));
  }

  /** Generate bills for one customer. Useful for manual single-customer billing. */
  async generateForCustomer(
    sellerUserId: string,
    customerId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<Bill> {
    const seller = await this.sellers.findOne({
      where: { user_id: sellerUserId },
    });
    if (!seller) throw new Error('Seller not found');
    const customer = await this.customers.findOne({
      where: { id: customerId, seller_id: seller.id },
    });
    if (!customer) throw new Error('Customer not found');
    const bill = await this.buildBill(seller, customer, periodStart, periodEnd);
    return bill;
  }

  private async generateForSeller(sellerId: string, today: Date): Promise<number> {
    // Period: previous month, day 1 to last day
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const periodStart = start.toISOString().slice(0, 10);
    const periodEnd = end.toISOString().slice(0, 10);

    const customers = await this.customers.find({
      where: { seller_id: sellerId },
    });
    const seller = await this.sellers.findOne({ where: { id: sellerId } });
    if (!seller) return 0;

    let count = 0;
    for (const c of customers) {
      // Skip if bill already exists
      const existing = await this.bills.findOne({
        where: {
          seller_id: sellerId,
          customer_id: c.id,
          period_start: periodStart,
          period_end: periodEnd,
        },
      });
      if (existing) continue;
      const bill = await this.buildBill(seller, c, periodStart, periodEnd);
      if (bill && Number(bill.total_amount) > 0) count++;
    }
    return count;
  }

  private async buildBill(
    seller: Seller,
    customer: Customer,
    periodStart: string,
    periodEnd: string,
  ): Promise<Bill> {
    const deliveries = await this.deliveries
      .createQueryBuilder('d')
      .where('d.customer_id = :id', { id: customer.id })
      .andWhere('d.delivery_date BETWEEN :s AND :e', {
        s: periodStart,
        e: periodEnd,
      })
      .andWhere(`d.status IN ('delivered','partial','extra')`)
      .orderBy('d.delivery_date', 'ASC')
      .getMany();

    let subtotal = 0;
    const items: Partial<BillItem>[] = [];
    for (const d of deliveries) {
      const qty = Number(d.delivered_quantity ?? d.expected_quantity ?? 0);
      const rate = Number(d.unit_rate ?? 0);
      const lineTotal = +(qty * rate).toFixed(2);
      subtotal += lineTotal;
      items.push({
        delivery_date: d.delivery_date,
        slot: d.slot,
        product_id: d.product_id ?? null,
        quantity: qty,
        unit_rate: rate,
        line_total: lineTotal,
      });
    }

    return this.ds.transaction(async (tx) => {
      const billRepo = tx.getRepository(Bill);
      const itemRepo = tx.getRepository(BillItem);

      const billNumber = await this.nextBillNumber(billRepo);

      const total = +subtotal.toFixed(2);
      const bill = billRepo.create({
        bill_number: billNumber,
        seller_id: seller.id,
        customer_id: customer.id,
        period_start: periodStart,
        period_end: periodEnd,
        subtotal: total,
        tax_amount: 0,
        discount: 0,
        total_amount: total,
        paid_amount: 0,
        due_date: this.dueDate(periodEnd),
        status: total > 0 ? 'pending' : 'void',
        generated_at: new Date(),
        // pdf_url left null - real PDF generation is a Phase 6 task; the
        // mobile app can still render the breakdown from bill_items.
      });
      const saved = await billRepo.save(bill);

      for (const it of items) {
        await itemRepo.save(itemRepo.create({ ...it, bill_id: saved.id }));
      }
      return saved;
    });
  }

  private dueDate(periodEnd: string): string {
    const d = new Date(periodEnd);
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }

  private async nextBillNumber(billRepo: Repository<Bill>): Promise<string> {
    const ym = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = await billRepo
      .createQueryBuilder('b')
      .where('b.bill_number LIKE :p', { p: `INV-${ym}-%` })
      .getCount();
    return `INV-${ym}-${String(seq + 1).padStart(4, '0')}`;
  }
}
