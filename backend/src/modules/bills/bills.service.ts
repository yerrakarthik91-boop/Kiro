import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Bill, BillStatus } from './entities/bill.entity';
import { BillItem } from './entities/bill-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { SellersService } from '../sellers/sellers.service';
import { BuyersService } from '../buyers/buyers.service';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill) private bills: Repository<Bill>,
    @InjectRepository(BillItem) private items: Repository<BillItem>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    @InjectRepository(Seller) private sellers: Repository<Seller>,
    private sellersService: SellersService,
    private buyers: BuyersService,
  ) {}

  async listForSeller(
    userId: string,
    q: { status?: BillStatus | 'all' } = {},
  ): Promise<Array<Bill & { customer_name: string }>> {
    const seller = await this.sellersService.findByUserId(userId);
    const where: Record<string, unknown> = { seller_id: seller.id };
    if (q.status && q.status !== 'all') where.status = q.status;
    const rows = await this.bills.find({
      where,
      order: { generated_at: 'DESC', created_at: 'DESC' },
    });
    if (!rows.length) return [];
    const customers = await this.customers.find({
      where: { id: In(rows.map((r) => r.customer_id)) },
    });
    const map = new Map(customers.map((c) => [c.id, c.name]));
    return rows.map((b) => ({ ...b, customer_name: map.get(b.customer_id) ?? '?' }));
  }

  async getDetail(
    userId: string,
    role: 'seller' | 'buyer',
    id: string,
  ): Promise<{ bill: Bill; items: BillItem[]; customer: Customer; seller: Seller }> {
    const bill = await this.bills.findOne({ where: { id } });
    if (!bill) throw new NotFoundException('Bill not found');

    if (role === 'seller') {
      const seller = await this.sellersService.findByUserId(userId);
      if (bill.seller_id !== seller.id) throw new NotFoundException();
    } else {
      const buyer = await this.buyers.getOrCreateForUser(userId);
      const c = await this.customers.findOne({
        where: { id: bill.customer_id, buyer_id: buyer.id },
      });
      if (!c) throw new NotFoundException();
    }

    const items = await this.items.find({
      where: { bill_id: id },
      order: { delivery_date: 'ASC', slot: 'ASC' },
    });
    const customer = await this.customers.findOne({
      where: { id: bill.customer_id },
    });
    if (!customer) throw new NotFoundException();
    const seller = await this.sellers.findOne({ where: { id: bill.seller_id } });
    if (!seller) throw new NotFoundException();
    return { bill, items, customer, seller };
  }

  async listForBuyer(userId: string): Promise<Array<Bill & { seller_id: string }>> {
    const buyer = await this.buyers.getOrCreateForUser(userId);
    const customers = await this.customers.find({
      where: { buyer_id: buyer.id },
    });
    if (!customers.length) return [];
    return this.bills.find({
      where: { customer_id: In(customers.map((c) => c.id)) },
      order: { period_end: 'DESC' },
    });
  }
}
