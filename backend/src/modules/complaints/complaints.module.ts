import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from './entities/complaint.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ComplaintsService } from './complaints.service';
import { BuyerComplaintsController } from './buyer-complaints.controller';
import { SellerComplaintsController } from './seller-complaints.controller';
import { SellersModule } from '../sellers/sellers.module';
import { BuyersModule } from '../buyers/buyers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Complaint, Customer]),
    SellersModule,
    BuyersModule,
  ],
  providers: [ComplaintsService],
  controllers: [BuyerComplaintsController, SellerComplaintsController],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
