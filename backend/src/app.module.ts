import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { BillsModule } from './modules/bills/bills.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { Product } from './modules/products/entities/product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
    TypeOrmModule.forFeature([Product]),
    NotificationsModule,
    AuthModule,
    UsersModule,
    SellersModule,
    BuyersModule,
    CustomersModule,
    ProductsModule,
    DeliveriesModule,
    BillsModule,
    PaymentsModule,
    ComplaintsModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectRepository(Product) private products: Repository<Product>,
  ) {}

  /** Seed the system-default products on first run if none exist. */
  async onModuleInit() {
    const count = await this.products.count({ where: { seller_id: IsNull() } });
    if (count > 0) return;
    await this.products.save([
      this.products.create({
        seller_id: null,
        name: 'Cow Milk',
        type: 'cow',
        unit: 'liter',
        default_rate: 60,
        is_active: true,
      }),
      this.products.create({
        seller_id: null,
        name: 'Buffalo Milk',
        type: 'buffalo',
        unit: 'liter',
        default_rate: 80,
        is_active: true,
      }),
      this.products.create({
        seller_id: null,
        name: 'Toned Milk',
        type: 'toned',
        unit: 'liter',
        default_rate: 50,
        is_active: true,
      }),
    ]);
  }
}
