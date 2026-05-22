import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Seller } from './entities/seller.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Delivery } from '../deliveries/entities/delivery.entity';
import { Bill } from '../bills/entities/bill.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller) private sellers: Repository<Seller>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    @InjectRepository(Delivery) private deliveries: Repository<Delivery>,
    @InjectRepository(Bill) private bills: Repository<Bill>,
    @InjectRepository(Payment) private payments: Repository<Payment>,
  ) {}

  async findByUserId(userId: string): Promise<Seller> {
    const seller = await this.sellers.findOne({ where: { user_id: userId } });
    if (!seller) throw new NotFoundException('Seller profile not found');
    return seller;
  }

  async getOrCreateForUser(
    userId: string,
    defaults: Partial<Seller> = {},
  ): Promise<Seller> {
    let seller = await this.sellers.findOne({ where: { user_id: userId } });
    if (!seller) {
      seller = this.sellers.create({
        user_id: userId,
        business_name: defaults.business_name ?? 'My Dairy',
        invite_code: this.generateInviteCode(),
        billing_cycle_day: 1,
        ...defaults,
      });
      seller = await this.sellers.save(seller);
    }
    return seller;
  }

  async update(userId: string, patch: Partial<Seller>): Promise<Seller> {
    const seller = await this.findByUserId(userId);
    Object.assign(seller, patch);
    return this.sellers.save(seller);
  }

  /** Aggregate KPIs for the seller dashboard (PRD §8 / SE-DB-01..05). */
  async dashboard(userId: string) {
    const seller = await this.findByUserId(userId);
    const today = new Date().toISOString().slice(0, 10);

    // Today's deliveries
    const todayDeliveries = await this.deliveries.find({
      where: { seller_id: seller.id, delivery_date: today },
    });
    const totalMilk = sum(todayDeliveries.map((d) => Number(d.expected_quantity)));
    const deliveredMilk = sum(
      todayDeliveries
        .filter((d) => d.status === 'delivered' || d.status === 'partial' || d.status === 'extra')
        .map((d) => Number(d.delivered_quantity ?? d.expected_quantity)),
    );
    const revenueToday = sum(
      todayDeliveries
        .filter((d) => d.status === 'delivered' || d.status === 'partial' || d.status === 'extra')
        .map((d) => Number(d.delivered_quantity ?? d.expected_quantity) * Number(d.unit_rate)),
    );
    const pending = todayDeliveries.filter((d) => d.status === 'pending').length;
    const completed = todayDeliveries.filter((d) => d.status === 'delivered' || d.status === 'partial').length;
    const missed = todayDeliveries.filter((d) => d.status === 'missed').length;

    // Active customers
    const activeCustomers = await this.customers.count({
      where: { seller_id: seller.id, status: 'active' },
    });

    // Pending payments
    const pendingBills = await this.bills.find({
      where: [
        { seller_id: seller.id, status: 'pending' },
        { seller_id: seller.id, status: 'partial' },
        { seller_id: seller.id, status: 'overdue' },
      ],
    });
    const pendingAmount = sum(pendingBills.map((b) => Number(b.balance ?? Number(b.total_amount) - Number(b.paid_amount))));

    // Today's collections
    const startOfDay = new Date(`${today}T00:00:00.000Z`);
    const endOfDay = new Date(`${today}T23:59:59.999Z`);
    const todayPayments = await this.payments.find({
      where: {
        seller_id: seller.id,
        status: 'success',
        paid_at: Between(startOfDay, endOfDay),
      },
    });
    const collectionsToday = sum(todayPayments.map((p) => Number(p.amount)));

    return {
      seller_id: seller.id,
      business_name: seller.business_name,
      invite_code: seller.invite_code,
      cards: {
        total_milk_today: totalMilk,
        delivered_milk: deliveredMilk,
        revenue_today: revenueToday,
        active_customers: activeCustomers,
        pending_payments: pendingAmount,
        collections_today: collectionsToday,
      },
      delivery_summary: { pending, completed, missed },
    };
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
