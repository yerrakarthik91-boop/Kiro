import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { Customer } from '../customers/entities/customer.entity';
import { Delivery } from '../deliveries/entities/delivery.entity';
import { Bill } from '../bills/entities/bill.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller, Customer, Delivery, Bill, Payment])],
  providers: [SellersService],
  controllers: [SellersController],
  exports: [SellersService, TypeOrmModule],
})
export class SellersModule {}
