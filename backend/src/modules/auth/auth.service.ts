import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { OtpService } from './otp.service';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly otp: OtpService,
    private readonly jwt: JwtService,
  ) {}

  async requestOtp(phone: string) {
    const code = await this.otp.generateAndStore(phone);
    // In development we surface the OTP in the response for testing.
    // In production this MUST be removed and the OTP delivered only via SMS.
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
    }

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
}
