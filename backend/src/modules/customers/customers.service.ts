import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Customer, CustomerStatus } from './entities/customer.entity';
import { Buyer } from '../buyers/entities/buyer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SellersService } from '../sellers/sellers.service';

export interface CustomerListQuery {
  q?: string;
  status?: CustomerStatus;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private repo: Repository<Customer>,
    @InjectRepository(Buyer) private buyers: Repository<Buyer>,
    private sellers: SellersService,
  ) {}

  async list(userId: string, q: CustomerListQuery): Promise<Customer[]> {
    const seller = await this.sellers.findByUserId(userId);
    const where: Record<string, unknown> = { seller_id: seller.id };
    if (q.status) where.status = q.status;
    if (q.q) where.name = ILike(`%${q.q}%`);
    return this.repo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Customer> {
    const seller = await this.sellers.findByUserId(userId);
    const c = await this.repo.findOne({ where: { id, seller_id: seller.id } });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async create(userId: string, dto: CreateCustomerDto): Promise<Customer> {
    const seller = await this.sellers.findByUserId(userId);

    const existing = await this.repo.findOne({
      where: { seller_id: seller.id, phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException(
        'A customer with this phone already exists for this seller',
      );
    }

    // Auto-link to a buyer if one already exists with this phone
    const buyer = await this.findBuyerByPhone(dto.phone);

    const customer = this.repo.create({
      seller_id: seller.id,
      buyer_id: buyer?.id,
      name: dto.name,
      phone: dto.phone,
      alt_phone: dto.alt_phone ?? null,
      address: dto.address ?? null,
      delivery_type: dto.delivery_type,
      morning_quantity: dto.morning_quantity,
      evening_quantity: dto.evening_quantity,
      milk_rate: dto.milk_rate ?? seller.default_milk_rate ?? null,
      product_id: dto.product_id ?? null,
      billing_cycle: dto.billing_cycle ?? 'monthly',
      billing_start_date:
        dto.billing_start_date ?? new Date().toISOString().slice(0, 10),
      status: 'active',
      linked_at: buyer ? new Date() : null,
    });
    return this.repo.save(customer);
  }

  async update(userId: string, id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const c = await this.findOne(userId, id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async pause(userId: string, id: string): Promise<Customer> {
    return this.update(userId, id, { status: 'paused' });
  }

  async resume(userId: string, id: string): Promise<Customer> {
    return this.update(userId, id, { status: 'active' });
  }

  async remove(userId: string, id: string): Promise<void> {
    const c = await this.findOne(userId, id);
    await this.repo.softRemove(c);
  }

  /** For internal use: load buyer record by phone (matches users.phone). */
  private async findBuyerByPhone(phone: string): Promise<Buyer | null> {
    return this.buyers
      .createQueryBuilder('b')
      .leftJoin('users', 'u', 'u.id = b.user_id')
      .where('u.phone = :phone', { phone })
      .getOne();
  }
}
