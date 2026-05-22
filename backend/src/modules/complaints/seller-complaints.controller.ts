import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { ComplaintsService } from './complaints.service';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

@ApiTags('seller-complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller')
@Controller('seller/complaints')
export class SellerComplaintsController {
  constructor(private readonly svc: ComplaintsService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.listForSeller(user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateComplaintDto,
  ) {
    return this.svc.update(user.id, id, dto);
  }
}
