import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buyer } from './entities/buyer.entity';
import { BuyersService } from './buyers.service';
import { BuyersController } from './buyers.controller';
import { Seller } from '../sellers/entities/seller.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Bill } from '../bills/entities/bill.entity';
import { Delivery } from '../deliveries/entities/delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Buyer, Seller, Customer, Bill, Delivery]),
  ],
  providers: [BuyersService],
  controllers: [BuyersController],
  exports: [BuyersService, TypeOrmModule],
})
export class BuyersModule {}
