import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { ScheduleService } from './schedule.service';
import { ExtraRequestDto, PauseScheduleDto } from './dto/schedule.dto';

@ApiTags('buyer-schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('buyer')
@Controller('buyer/schedule')
export class BuyerScheduleController {
  constructor(private readonly svc: ScheduleService) {}

  @Post('pause')
  pause(@CurrentUser() user: CurrentUserPayload, @Body() dto: PauseScheduleDto) {
    return this.svc.pause(user.id, dto, 'pause');
  }

  @Post('vacation')
  vacation(@CurrentUser() user: CurrentUserPayload, @Body() dto: PauseScheduleDto) {
    return this.svc.pause(user.id, dto, 'vacation');
  }

  @Post('resume')
  resume(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.resume(user.id);
  }

  @Post('extra-request')
  extra(@CurrentUser() user: CurrentUserPayload, @Body() dto: ExtraRequestDto) {
    return this.svc.extraRequest(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.listForBuyer(user.id);
  }

  @Get('status')
  status(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.statusForBuyer(user.id);
  }
}
