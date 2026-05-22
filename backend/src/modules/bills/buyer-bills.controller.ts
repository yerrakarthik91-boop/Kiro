import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { BillsService } from './bills.service';

@ApiTags('buyer-bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('buyer')
@Controller('buyer/bills')
export class BuyerBillsController {
  constructor(private readonly svc: BillsService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.listForBuyer(user.id);
  }

  @Get(':id')
  detail(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.getDetail(user.id, 'buyer', id);
  }
}
