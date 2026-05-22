import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SellersService } from '../sellers/sellers.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private sellers: SellersService,
  ) {}

  async listForSeller(userId: string): Promise<Product[]> {
    const seller = await this.sellers.findByUserId(userId);
    return this.repo.find({
      where: [
        { seller_id: seller.id, is_active: true },
        { seller_id: IsNull(), is_active: true }, // system seeds
      ],
      order: { created_at: 'ASC' },
    });
  }

  async create(userId: string, dto: CreateProductDto): Promise<Product> {
    const seller = await this.sellers.findByUserId(userId);
    return this.repo.save(
      this.repo.create({
        seller_id: seller.id,
        name: dto.name,
        type: dto.type ?? 'custom',
        unit: dto.unit ?? 'liter',
        default_rate: dto.default_rate,
        is_active: true,
      }),
    );
  }

  async update(userId: string, id: string, dto: UpdateProductDto): Promise<Product> {
    const seller = await this.sellers.findByUserId(userId);
    const p = await this.repo.findOne({ where: { id, seller_id: seller.id } });
    if (!p) throw new NotFoundException('Product not found');
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  async remove(userId: string, id: string): Promise<void> {
    const seller = await this.sellers.findByUserId(userId);
    const p = await this.repo.findOne({ where: { id, seller_id: seller.id } });
    if (!p) throw new NotFoundException('Product not found');
    p.is_active = false;
    await this.repo.save(p);
  }
}
