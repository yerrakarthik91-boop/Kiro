import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { SellersService } from '../sellers/sellers.service';
import { BuyersService } from '../buyers/buyers.service';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint) private repo: Repository<Complaint>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    private sellers: SellersService,
    private buyers: BuyersService,
  ) {}

  async createForBuyer(
    userId: string,
    dto: CreateComplaintDto,
  ): Promise<Complaint> {
    const buyer = await this.buyers.getOrCreateForUser(userId);
    // Pick the first linked customer for this buyer (a real implementation
    // could let the user choose if they have multiple sellers).
    const customer = await this.customers.findOne({
      where: { buyer_id: buyer.id },
    });
    if (!customer) {
      throw new NotFoundException('No linked seller — link via invite code first');
    }
    return this.repo.save(
      this.repo.create({
        customer_id: customer.id,
        seller_id: customer.seller_id,
        category: dto.category,
        description: dto.description ?? null,
        photo_url: dto.photo_url ?? null,
        delivery_id: dto.delivery_id ?? null,
        bill_id: dto.bill_id ?? null,
        status: 'open',
      }),
    );
  }

  async listForBuyer(userId: string): Promise<Complaint[]> {
    const buyer = await this.buyers.getOrCreateForUser(userId);
    const customers = await this.customers.find({
      where: { buyer_id: buyer.id },
    });
    if (!customers.length) return [];
    return this.repo.find({
      where: { customer_id: In(customers.map((c) => c.id)) },
      order: { created_at: 'DESC' },
    });
  }

  async listForSeller(userId: string): Promise<Complaint[]> {
    const seller = await this.sellers.findByUserId(userId);
    return this.repo.find({
      where: { seller_id: seller.id },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateComplaintDto,
  ): Promise<Complaint> {
    const seller = await this.sellers.findByUserId(userId);
    const c = await this.repo.findOne({ where: { id, seller_id: seller.id } });
    if (!c) throw new NotFoundException();
    c.status = dto.status;
    if (dto.resolution_note !== undefined) c.resolution_note = dto.resolution_note;
    if (dto.status === 'resolved' || dto.status === 'rejected') {
      c.resolved_at = new Date();
    }
    return this.repo.save(c);
  }
}
