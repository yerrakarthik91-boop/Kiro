import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { BillItem } from './entities/bill-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Delivery } from '../deliveries/entities/delivery.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { BillsService } from './bills.service';
import { SellerBillsController } from './seller-bills.controller';
import { BuyerBillsController } from './buyer-bills.controller';
import { BillGeneratorService } from './bill-generator.service';
import { SellersModule } from '../sellers/sellers.module';
import { BuyersModule } from '../buyers/buyers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill, BillItem, Customer, Delivery, Seller]),
    SellersModule,
    BuyersModule,
  ],
  providers: [BillsService, BillGeneratorService],
  controllers: [SellerBillsController, BuyerBillsController],
  exports: [BillsService, TypeOrmModule],
})
export class BillsModule {}
