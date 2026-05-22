import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IsIn, IsOptional, IsString } from 'class-validator';

class UpdateMeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsIn(['system', 'light', 'dark']) theme?: 'system' | 'light' | 'dark';
  @IsOptional() @IsString() fcm_token?: string;
}

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class UsersController {
  constructor(
    private readonly svc: UsersService,
    private readonly notif: NotificationsService,
  ) {}

  @Get()
  async me(@CurrentUser() user: CurrentUserPayload) {
    const u = await this.svc.findById(user.id);
    return {
      id: u.id,
      role: u.role,
      phone: u.phone,
      name: u.name,
      language: u.language,
      theme: u.theme,
    };
  }

  @Patch()
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateMeDto,
  ) {
    return this.svc.update(user.id, dto);
  }

  @Get('notifications')
  notifications(@CurrentUser() user: CurrentUserPayload) {
    return this.notif.list(user.id);
  }

  @Patch('notifications/:id/read')
  async markRead(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    await this.notif.markRead(user.id, id);
    return { ok: true };
  }
}
