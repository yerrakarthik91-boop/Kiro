import {
  Body,
  Controller,
  Delete,
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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerStatus } from './entities/customer.entity';

@ApiTags('seller-customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller')
@Controller('seller/customers')
export class CustomersController {
  constructor(private readonly svc: CustomersService) {}

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query('q') q?: string,
    @Query('status') status?: CustomerStatus,
  ) {
    return this.svc.list(user.id, { q, status });
  }

  @Get(':id')
  one(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateCustomerDto) {
    return this.svc.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.svc.update(user.id, id, dto);
  }

  @Post(':id/pause')
  pause(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.pause(user.id, id);
  }

  @Post(':id/resume')
  resume(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.resume(user.id, id);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    await this.svc.remove(user.id, id);
    return { ok: true };
  }
}
