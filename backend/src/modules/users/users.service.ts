import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, patch: Partial<User>): Promise<User> {
    const u = await this.findById(id);
    Object.assign(u, patch);
    return this.repo.save(u);
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.repo.findOne({ where: { phone } });
  }
}
