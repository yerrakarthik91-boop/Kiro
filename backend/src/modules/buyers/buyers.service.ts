import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Buyer } from './entities/buyer.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Bill } from '../bills/entities/bill.entity';
import { Delivery } from '../deliveries/entities/delivery.entity';

@Injectable()
export class BuyersService {
  constructor(
    @InjectRepository(Buyer) private buyers: Repository<Buyer>,
    @InjectRepository(Seller) private sellers: Repository<Seller>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    @InjectRepository(Bill) private bills: Repository<Bill>,
    @InjectRepository(Delivery) private deliveries: Repository<Delivery>,
  ) {}

  async getOrCreateForUser(
    userId: string,
    defaults: Partial<Buyer> = {},
  ): Promise<Buyer> {
    let buyer = await this.buyers.findOne({ where: { user_id: userId } });
    if (!buyer) {
      buyer = this.buyers.create({ user_id: userId, ...defaults });
      buyer = await this.buyers.save(buyer);
    }
    return buyer;
  }

  async findByUserId(userId: string): Promise<Buyer> {
    const buyer = await this.buyers.findOne({ where: { user_id: userId } });
    if (!buyer) throw new NotFoundException('Buyer profile not found');
    return buyer;
  }

  /**
   * Link a buyer to a seller via invite code. Auto-merges with an existing
   * customer row that has the same phone, otherwise creates a new customer.
   */
  async linkSeller(
    userId: string,
    phone: string,
    name: string,
    inviteCode: string,
  ): Promise<{ seller_id: string; customer_id: string }> {
    const seller = await this.sellers.findOne({
      where: { invite_code: inviteCode.toUpperCase() },
    });
    if (!seller) {
      throw new UnprocessableEntityException('Invalid invite code');
    }

    const buyer = await this.getOrCreateForUser(userId);

    // Try to find existing customer by phone within this seller
    let customer = await this.customers.findOne({
      where: { seller_id: seller.id, phone },
    });
    if (customer) {
      customer.buyer_id = buyer.id;
      customer.linked_at = new Date();
      customer = await this.customers.save(customer);
    } else {
      customer = this.customers.create({
        seller_id: seller.id,
        buyer_id: buyer.id,
        name,
        phone,
        delivery_type: 'morning',
        morning_quantity: 1.0,
        evening_quantity: 0,
        billing_cycle: 'monthly',
        billing_start_date: new Date().toISOString().slice(0, 10),
        status: 'active',
        linked_at: new Date(),
      });
      customer = await this.customers.save(customer);
    }

    return { seller_id: seller.id, customer_id: customer.id };
  }

  /** BU-01 Buyer Dashboard payload. */
  async dashboard(userId: string) {
    const buyer = await this.getOrCreateForUser(userId);
    const customers = await this.customers.find({
      where: { buyer_id: buyer.id, status: 'active' },
    });

    const morning = customers.reduce(
      (a, c) => a + Number(c.morning_quantity ?? 0),
      0,
    );
    const evening = customers.reduce(
      (a, c) => a + Number(c.evening_quantity ?? 0),
      0,
    );

    // monthly consumption (current month so far)
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = now.toISOString().slice(0, 10);
    const monthlyDeliveries = await this.deliveries
      .createQueryBuilder('d')
      .where('d.customer_id IN (:...ids)', { ids: customers.map((c) => c.id).concat(['00000000-0000-0000-0000-000000000000']) })
      .andWhere('d.delivery_date BETWEEN :start AND :end', { start, end })
      .andWhere(`d.status IN ('delivered', 'partial', 'extra')`)
      .getMany();
    const monthlyConsumption = monthlyDeliveries.reduce(
      (a, d) => a + Number(d.delivered_quantity ?? d.expected_quantity ?? 0),
      0,
    );

    // current bill = sum of unpaid balances across linked customers
    const customerIds = customers.map((c) => c.id);
    const bills = customerIds.length
      ? await this.bills
          .createQueryBuilder('b')
          .where('b.customer_id IN (:...ids)', { ids: customerIds })
          .andWhere(`b.status IN ('pending', 'partial', 'overdue')`)
          .orderBy('b.period_end', 'DESC')
          .getMany()
      : [];
    const currentBill = bills.reduce(
      (a, b) => a + Number(b.total_amount) - Number(b.paid_amount),
      0,
    );
    const dueDate = bills[0]?.due_date ?? null;
    const billStatus = bills[0]?.status ?? 'paid';

    return {
      buyer_id: buyer.id,
      welcome_name: customers[0]?.name ?? 'Customer',
      milk_summary: {
        morning_quantity: morning,
        evening_quantity: evening,
        monthly_consumption: monthlyConsumption,
      },
      billing: {
        current_bill: currentBill,
        due_date: dueDate,
        status: billStatus,
      },
      linked_sellers_count: new Set(customers.map((c) => c.seller_id)).size,
    };
  }
}
