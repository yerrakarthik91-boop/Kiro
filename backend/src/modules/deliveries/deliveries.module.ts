import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { ScheduleChange } from './entities/schedule-change.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { BuyerDeliveriesController } from './buyer-deliveries.controller';
import { DeliveryGeneratorService } from './delivery-generator.service';
import { ScheduleService } from './schedule.service';
import { BuyerScheduleController } from './buyer-schedule.controller';
import { SellersModule } from '../sellers/sellers.module';
import { BuyersModule } from '../buyers/buyers.module';
import { Seller } from '../sellers/entities/seller.entity';
import { Buyer } from '../buyers/entities/buyer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delivery,
      ScheduleChange,
      Customer,
      Product,
      Seller,
      Buyer,
    ]),
    SellersModule,
    BuyersModule,
  ],
  providers: [DeliveriesService, DeliveryGeneratorService, ScheduleService],
  controllers: [
    DeliveriesController,
    BuyerDeliveriesController,
    BuyerScheduleController,
  ],
  exports: [DeliveriesService, ScheduleService, TypeOrmModule],
})
export class DeliveriesModule {}
