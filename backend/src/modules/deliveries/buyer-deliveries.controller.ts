import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { DeliveriesService } from './deliveries.service';

@ApiTags('buyer-deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('buyer')
@Controller('buyer/deliveries')
export class BuyerDeliveriesController {
  constructor(private readonly svc: DeliveriesService) {}

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.svc.listForBuyer(user.id, { from, to });
  }

  @Get('calendar')
  calendar(
    @CurrentUser() user: CurrentUserPayload,
    @Query('month') month?: string, // YYYY-MM
  ) {
    return this.svc.calendarForBuyer(
      user.id,
      month ?? new Date().toISOString().slice(0, 7),
    );
  }
}
