import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { BillGeneratorService } from './bill-generator.service';
import { BillStatus } from './entities/bill.entity';
import { GenerateBillDto } from './dto/generate-bill.dto';
import { PdfService } from './pdf.service';

@ApiTags('seller-bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller')
@Controller('seller/bills')
export class SellerBillsController {
  constructor(
    private readonly svc: BillsService,
    private readonly generator: BillGeneratorService,
    private readonly pdf: PdfService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: BillStatus | 'all',
  ) {
    return this.svc.listForSeller(user.id, { status });
  }

  @Get(':id')
  detail(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.getDetail(user.id, 'seller', id);
  }

  @Get(':id/pdf')
  async pdfStream(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const detail = await this.svc.getDetail(user.id, 'seller', id);
    const buf = await this.pdf.renderBill(detail);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${detail.bill.bill_number}.pdf"`,
    );
    res.send(buf);
  }

  @Post('generate')
  generate(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GenerateBillDto,
  ) {
    return this.generator.generateForCustomer(
      user.id,
      dto.customer_id,
      dto.period_start,
      dto.period_end,
    );
  }

  @Post('generate-now')
  generateNow(@CurrentUser() user: CurrentUserPayload) {
    return this.generator.generateNow(user.id);
  }
}
