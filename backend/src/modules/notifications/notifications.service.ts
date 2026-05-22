import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from './entities/notification.entity';

/**
 * Notifications adapter. In v1 we only persist notification rows — the
 * mobile app reads from /me/notifications. Real FCM / SMS / WhatsApp
 * dispatch is stubbed (Phase 6 of the roadmap).
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationLog)
    private repo: Repository<NotificationLog>,
  ) {}

  async send(args: {
    user_id: string;
    type: string;
    title: string;
    body: string;
    channel?: 'push' | 'sms' | 'whatsapp';
    data?: Record<string, unknown>;
  }): Promise<NotificationLog> {
    this.logger.log(`[notify] -> ${args.user_id}: ${args.title}`);
    // TODO: dispatch via FCM / Twilio / WABA.
    return this.repo.save(
      this.repo.create({
        user_id: args.user_id,
        type: args.type,
        title: args.title,
        body: args.body,
        channel: args.channel ?? 'push',
        data: args.data ?? null,
        is_read: false,
      }),
    );
  }

  list(userId: string) {
    return this.repo.find({
      where: { user_id: userId },
      order: { sent_at: 'DESC' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.repo.update({ id, user_id: userId }, { is_read: true });
  }
}
