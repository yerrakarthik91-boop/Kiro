import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@ApiTags('seller-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller')
@Controller('seller/reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('daily')
  daily(@CurrentUser() user: CurrentUserPayload, @Query('date') date?: string) {
    return this.svc.daily(user.id, date);
  }

  @Get('monthly')
  monthly(
    @CurrentUser() user: CurrentUserPayload,
    @Query('month') month?: string,
  ) {
    return this.svc.monthly(user.id, month);
  }

  @Get('profit-loss')
  profitLoss(
    @CurrentUser() user: CurrentUserPayload,
    @Query('range') range: 'day' | 'week' | 'month' = 'month',
  ) {
    return this.svc.profitLoss(user.id, range);
  }

  @Get('customer/:id')
  customer(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.svc.customer(user.id, id);
  }
}
