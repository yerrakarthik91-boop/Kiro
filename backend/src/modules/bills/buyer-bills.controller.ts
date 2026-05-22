import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { BillsService } from './bills.service';
import { PdfService } from './pdf.service';

@ApiTags('buyer-bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('buyer')
@Controller('buyer/bills')
export class BuyerBillsController {
  constructor(
    private readonly svc: BillsService,
    private readonly pdf: PdfService,
  ) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.listForBuyer(user.id);
  }

  @Get(':id')
  detail(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.getDetail(user.id, 'buyer', id);
  }

  @Get(':id/pdf')
  async pdfStream(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const detail = await this.svc.getDetail(user.id, 'buyer', id);
    const buf = await this.pdf.renderBill(detail);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${detail.bill.bill_number}.pdf"`,
    );
    res.send(buf);
  }
}
