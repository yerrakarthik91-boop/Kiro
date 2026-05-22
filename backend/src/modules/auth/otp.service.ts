import { Injectable, Logger } from '@nestjs/common';

// Dev-grade OTP store. In production this should be backed by Redis with a
// short TTL (5 min) and the SMS dispatch should go through Twilio / MSG91.
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private store = new Map<string, { code: string; expiresAt: number }>();

  async generateAndStore(phone: string): Promise<string> {
    const code =
      process.env.NODE_ENV === 'production'
        ? this.randomCode()
        : '123456'; // fixed dev code for easier manual testing
    this.store.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    this.logger.log(`OTP for ${phone}: ${code} (dev only)`);
    // TODO: integrate Twilio / MSG91 here for production.
    return code;
  }

  async verify(phone: string, code: string): Promise<boolean> {
    const entry = this.store.get(phone);
    if (!entry) return false;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(phone);
      return false;
    }
    const ok = entry.code === code;
    if (ok) this.store.delete(phone);
    return ok;
  }

  private randomCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
