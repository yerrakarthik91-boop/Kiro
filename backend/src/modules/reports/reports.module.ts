import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from '../deliveries/entities/delivery.entity';
import { Bill } from '../bills/entities/bill.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, Bill, Payment, Customer]),
    SellersModule,
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
