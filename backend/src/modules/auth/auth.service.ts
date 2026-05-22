import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { Buyer } from '../buyers/entities/buyer.entity';
import { OtpService } from './otp.service';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Seller) private readonly sellers: Repository<Seller>,
    @InjectRepository(Buyer) private readonly buyers: Repository<Buyer>,
    private readonly otp: OtpService,
    private readonly jwt: JwtService,
  ) {}

  async requestOtp(phone: string) {
    const code = await this.otp.generateAndStore(phone);
    const inDev = process.env.NODE_ENV !== 'production';
    return { sent: true, ...(inDev ? { dev_otp: code } : {}) };
  }

  async verifyOtp(dto: OtpVerifyDto) {
    const ok = await this.otp.verify(dto.phone, dto.otp);
    if (!ok) throw new UnauthorizedException('Invalid or expired OTP');

    let user = await this.users.findOne({ where: { phone: dto.phone } });

    if (!user) {
      if (!dto.role) {
        throw new BadRequestException(
          'role is required for first-time sign-up',
        );
      }
      user = this.users.create({
        phone: dto.phone,
        role: dto.role as UserRole,
        name: dto.name,
        language: 'en',
        theme: 'system',
      });
      user = await this.users.save(user);

      // Create the role-specific profile row
      if (user.role === 'seller') {
        await this.sellers.save(
          this.sellers.create({
            user_id: user.id,
            business_name: dto.name ? `${dto.name}'s Dairy` : 'My Dairy',
            invite_code: this.generateInviteCode(),
            billing_cycle_day: 1,
          }),
        );
      } else if (user.role === 'buyer') {
        await this.buyers.save(this.buyers.create({ user_id: user.id }));
      }
    }

    user.last_login_at = new Date();
    await this.users.save(user);

    const access = await this.jwt.signAsync(
      { sub: user.id, role: user.role, phone: user.phone },
      { expiresIn: process.env.JWT_ACCESS_TTL ?? '30m' },
    );
    const refresh = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_jwt_refresh_secret',
        expiresIn: process.env.JWT_REFRESH_TTL ?? '30d',
      },
    );

    return {
      access,
      refresh,
      user: {
        id: user.id,
        role: user.role,
        phone: user.phone,
        name: user.name,
      },
    };
  }

  async refresh(refresh: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(refresh, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_jwt_refresh_secret',
      });
      const user = await this.users.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      const access = await this.jwt.signAsync(
        { sub: user.id, role: user.role, phone: user.phone },
        { expiresIn: process.env.JWT_ACCESS_TTL ?? '30m' },
      );
      return { access };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }
}
