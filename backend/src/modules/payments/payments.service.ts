import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Bill } from '../bills/entities/bill.entity';
import { Customer } from '../customers/entities/customer.entity';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { SellersService } from '../sellers/sellers.service';
import { BuyersService } from '../buyers/buyers.service';
import { PaymentIntentDto } from './dto/payment-intent.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private payments: Repository<Payment>,
    @InjectRepository(Bill) private bills: Repository<Bill>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    private sellers: SellersService,
    private buyers: BuyersService,
    private ds: DataSource,
  ) {}

  /**
   * Seller-recorded payment. Allocates FIFO to the customer's outstanding
   * bills (oldest first), updates each bill's paid_amount and status.
   */
  async record(userId: string, dto: RecordPaymentDto): Promise<Payment> {
    const seller = await this.sellers.findByUserId(userId);
    return this.ds.transaction(async (tx) => {
      const paymentsRepo = tx.getRepository(Payment);
      const billsRepo = tx.getRepository(Bill);

      const payment = paymentsRepo.create({
        seller_id: seller.id,
        customer_id: dto.customer_id,
        bill_id: dto.bill_id ?? null,
        amount: dto.amount,
        method: dto.method,
        reference: dto.reference ?? null,
        status: 'success',
        recorded_by_user_id: userId,
        paid_at: dto.paid_at ? new Date(dto.paid_at) : new Date(),
      });
      const saved = await paymentsRepo.save(payment);

      await this.allocate(billsRepo, dto.customer_id, dto.amount, dto.bill_id);
      return saved;
    });
  }

  async listForSeller(
    userId: string,
    q: { from?: string; to?: string; method?: string } = {},
  ): Promise<Payment[]> {
    const seller = await this.sellers.findByUserId(userId);
    const qb = this.payments
      .createQueryBuilder('p')
      .where('p.seller_id = :id', { id: seller.id });
    if (q.from) qb.andWhere('p.paid_at >= :from', { from: q.from });
    if (q.to) qb.andWhere('p.paid_at <= :to', { to: q.to });
    if (q.method) qb.andWhere('p.method = :m', { m: q.method });
    qb.orderBy('p.paid_at', 'DESC');
    return qb.getMany();
  }

  async listForBuyer(userId: string): Promise<Payment[]> {
    const buyer = await this.buyers.getOrCreateForUser(userId);
    const customers = await this.customers.find({
      where: { buyer_id: buyer.id },
    });
    if (!customers.length) return [];
    return this.payments
      .createQueryBuilder('p')
      .where('p.customer_id IN (:...ids)', {
        ids: customers.map((c) => c.id),
      })
      .orderBy('p.paid_at', 'DESC')
      .getMany();
  }

  /**
   * MOCK gateway intent. Real Razorpay/PhonePe/Cashfree integration is a
   * Phase 5 task and requires merchant onboarding. The mobile app can use
   * this to test the success path end-to-end.
   */
  async createIntent(userId: string, dto: PaymentIntentDto) {
    const buyer = await this.buyers.getOrCreateForUser(userId);
    const bill = await this.bills.findOne({ where: { id: dto.bill_id } });
    if (!bill) throw new NotFoundException('Bill not found');
    const customer = await this.customers.findOne({
      where: { id: bill.customer_id, buyer_id: buyer.id },
    });
    if (!customer) throw new NotFoundException();

    return {
      gateway: dto.gateway ?? 'mock',
      order_id: `mock_${Date.now()}`,
      amount: Math.round(
        Number(bill.total_amount) - Number(bill.paid_amount),
      ) * 100,
      currency: 'INR',
      key: 'mock_key',
      mock_url: `/v1/buyer/payments/verify`,
    };
  }

  /** MOCK gateway verify: finalize a mock online payment. */
  async verifyIntent(userId: string, billId: string, amount: number) {
    const buyer = await this.buyers.getOrCreateForUser(userId);
    const bill = await this.bills.findOne({ where: { id: billId } });
    if (!bill) throw new NotFoundException();
    const customer = await this.customers.findOne({
      where: { id: bill.customer_id, buyer_id: buyer.id },
    });
    if (!customer) throw new NotFoundException();

    return this.ds.transaction(async (tx) => {
      const paymentsRepo = tx.getRepository(Payment);
      const billsRepo = tx.getRepository(Bill);

      const payment = paymentsRepo.create({
        seller_id: bill.seller_id,
        customer_id: bill.customer_id,
        bill_id: bill.id,
        amount,
        method: 'upi',
        reference: `mock_${Date.now()}`,
        gateway: 'mock',
        gateway_payment_id: `pay_${Date.now()}`,
        status: 'success',
        paid_at: new Date(),
      });
      const saved = await paymentsRepo.save(payment);
      await this.allocate(billsRepo, bill.customer_id, amount, bill.id);
      return saved;
    });
  }

  private async allocate(
    billsRepo: Repository<Bill>,
    customerId: string,
    amount: number,
    explicitBillId?: string | null,
  ): Promise<void> {
    const order = explicitBillId
      ? await billsRepo.find({ where: { id: explicitBillId } })
      : await billsRepo
          .createQueryBuilder('b')
          .where('b.customer_id = :c', { c: customerId })
          .andWhere(`b.status IN ('pending','partial','overdue')`)
          .orderBy('b.due_date', 'ASC')
          .getMany();

    let remaining = amount;
    for (const bill of order) {
      if (remaining <= 0) break;
      const balance = Number(bill.total_amount) - Number(bill.paid_amount);
      if (balance <= 0) continue;
      const apply = Math.min(remaining, balance);
      bill.paid_amount = Number(bill.paid_amount) + apply;
      const newBalance = Number(bill.total_amount) - bill.paid_amount;
      bill.status = newBalance <= 0 ? 'paid' : 'partial';
      await billsRepo.save(bill);
      remaining -= apply;
    }
  }
}
