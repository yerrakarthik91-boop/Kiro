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
import { SellersModule } from '../sellers/sellers.module';
import { BuyersModule } from '../buyers/buyers.module';
import { Seller } from '../sellers/entities/seller.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delivery,
      ScheduleChange,
      Customer,
      Product,
      Seller,
    ]),
    SellersModule,
    BuyersModule,
  ],
  providers: [DeliveriesService, DeliveryGeneratorService],
  controllers: [DeliveriesController, BuyerDeliveriesController],
  exports: [DeliveriesService, TypeOrmModule],
})
export class DeliveriesModule {}
