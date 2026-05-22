import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { PaymentIntentDto } from './dto/payment-intent.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('buyer-payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('buyer')
@Controller('buyer/payments')
export class BuyerPaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('intent')
  intent(@CurrentUser() user: CurrentUserPayload, @Body() dto: PaymentIntentDto) {
    return this.svc.createIntent(user.id, dto);
  }

  @Post('verify')
  verify(@CurrentUser() user: CurrentUserPayload, @Body() dto: VerifyPaymentDto) {
    return this.svc.verifyIntent(user.id, dto.bill_id, dto.amount);
  }

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.listForBuyer(user.id);
  }
}
