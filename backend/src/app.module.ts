import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
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
export class AppModule {}
