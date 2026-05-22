import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { DeliveriesService } from './deliveries.service';
import { MarkDeliveryDto } from './dto/mark-delivery.dto';
import { SyncDeliveriesDto } from './dto/sync-deliveries.dto';
import { DeliveryGeneratorService } from './delivery-generator.service';
import { DeliverySlot } from './entities/delivery.entity';

@ApiTags('seller-deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller')
@Controller('seller/deliveries')
export class DeliveriesController {
  constructor(
    private readonly svc: DeliveriesService,
    private readonly generator: DeliveryGeneratorService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query('date') date?: string,
    @Query('slot') slot?: DeliverySlot,
  ) {
    return this.svc.list(user.id, {
      date: date ?? new Date().toISOString().slice(0, 10),
      slot,
    });
  }

  @Patch(':id')
  mark(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: MarkDeliveryDto,
  ) {
    return this.svc.mark(user.id, id, dto);
  }

  @Post('sync')
  sync(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SyncDeliveriesDto,
  ) {
    return this.svc.sync(user.id, dto);
  }

  /**
   * Manual trigger for the daily generator. Useful in development; the
   * production app fires this via cron at 03:00 local seller TZ.
   */
  @Post('generate-now')
  generateNow(@CurrentUser() user: CurrentUserPayload) {
    return this.generator.generateForSellerByUserId(user.id);
  }
}
