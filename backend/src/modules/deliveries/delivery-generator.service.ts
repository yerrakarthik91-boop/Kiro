import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Delivery } from './entities/delivery.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { Product } from '../products/entities/product.entity';

/**
 * Pre-generates `deliveries` rows for tomorrow at 03:00 local seller TZ.
 * Each active customer with delivery_type morning/evening/both yields 1 or
 * 2 rows. Logic matches docs/07-Business-Logic.md §2.
 */
@Injectable()
export class DeliveryGeneratorService {
  private readonly logger = new Logger(DeliveryGeneratorService.name);

  constructor(
    @InjectRepository(Customer) private customers: Repository<Customer>,
    @InjectRepository(Delivery) private deliveries: Repository<Delivery>,
    @InjectRepository(Seller) private sellers: Repository<Seller>,
    @InjectRepository(Product) private products: Repository<Product>,
  ) {}

  /** Cron: every day at 03:00 server time. */
  @Cron('0 3 * * *')
  async runDaily() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await this.generateForDate(tomorrow.toISOString().slice(0, 10));
  }

  /** Manual generation triggered by a logged-in seller. */
  async generateForSellerByUserId(userId: string) {
    const seller = await this.sellers.findOne({ where: { user_id: userId } });
    if (!seller) return { created: 0 };
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().slice(0, 10);
    const created = await this.generateForSeller(seller.id, date);
    return { created, date };
  }

  private async generateForDate(date: string) {
    const sellers = await this.sellers.find();
    let total = 0;
    for (const s of sellers) {
      total += await this.generateForSeller(s.id, date);
    }
    this.logger.log(`Generated ${total} deliveries for ${date}`);
  }

  private async generateForSeller(sellerId: string, date: string): Promise<number> {
    const customers = await this.customers.find({
      where: { seller_id: sellerId, status: 'active' },
    });
    let count = 0;
    for (const c of customers) {
      const rate = await this.resolveRate(c, sellerId);
      const slots: Array<'morning' | 'evening'> = [];
      if (c.delivery_type === 'morning' || c.delivery_type === 'both') slots.push('morning');
      if (c.delivery_type === 'evening' || c.delivery_type === 'both') slots.push('evening');

      for (const slot of slots) {
        const qty = slot === 'morning' ? Number(c.morning_quantity) : Number(c.evening_quantity);
        if (qty <= 0) continue;
        // Idempotent: skip if a row already exists.
        const existing = await this.deliveries.findOne({
          where: { customer_id: c.id, delivery_date: date, slot },
        });
        if (existing) continue;
        await this.deliveries.save(
          this.deliveries.create({
            seller_id: sellerId,
            customer_id: c.id,
            product_id: c.product_id ?? null,
            delivery_date: date,
            slot,
            expected_quantity: qty,
            unit_rate: rate,
            status: 'pending',
          }),
        );
        count++;
      }
    }
    return count;
  }

  private async resolveRate(c: Customer, sellerId: string): Promise<number> {
    if (c.milk_rate != null) return Number(c.milk_rate);
    if (c.product_id) {
      const p = await this.products.findOne({ where: { id: c.product_id } });
      if (p?.default_rate != null) return Number(p.default_rate);
    }
    const s = await this.sellers.findOne({ where: { id: sellerId } });
    return Number(s?.default_milk_rate ?? 60.0);
  }
}
