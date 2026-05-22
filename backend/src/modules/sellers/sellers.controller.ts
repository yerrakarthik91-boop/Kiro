import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { SellersService } from './sellers.service';
import { UpdateSellerDto } from './dto/update-seller.dto';

@ApiTags('seller')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller')
@Controller('seller')
export class SellersController {
  constructor(private readonly sellers: SellersService) {}

  @Get('profile')
  async profile(@CurrentUser() user: CurrentUserPayload) {
    return this.sellers.getOrCreateForUser(user.id);
  }

  @Patch('profile')
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateSellerDto,
  ) {
    return this.sellers.update(user.id, dto);
  }

  @Get('dashboard')
  async dashboard(@CurrentUser() user: CurrentUserPayload) {
    return this.sellers.dashboard(user.id);
  }
}
