import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { BuyersService } from './buyers.service';
import { LinkSellerDto } from './dto/link-seller.dto';

@ApiTags('buyer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('buyer')
@Controller('buyer')
export class BuyersController {
  constructor(private readonly buyers: BuyersService) {}

  @Get('profile')
  async profile(@CurrentUser() user: CurrentUserPayload) {
    return this.buyers.getOrCreateForUser(user.id);
  }

  @Post('link-seller')
  async link(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: LinkSellerDto,
  ) {
    return this.buyers.linkSeller(
      user.id,
      dto.phone ?? user.phone,
      dto.name ?? 'Customer',
      dto.invite_code,
    );
  }

  @Get('dashboard')
  async dashboard(@CurrentUser() user: CurrentUserPayload) {
    return this.buyers.dashboard(user.id);
  }
}
