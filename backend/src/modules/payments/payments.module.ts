import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Bill } from '../bills/entities/bill.entity';
import { Customer } from '../customers/entities/customer.entity';
import { PaymentsService } from './payments.service';
import { SellerPaymentsController } from './seller-payments.controller';
import { BuyerPaymentsController } from './buyer-payments.controller';
import { SellersModule } from '../sellers/sellers.module';
import { BuyersModule } from '../buyers/buyers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Bill, Customer]),
    SellersModule,
    BuyersModule,
  ],
  providers: [PaymentsService],
  controllers: [SellerPaymentsController, BuyerPaymentsController],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
