import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, WalletService, TransactionsService],
})
export class OrdersModule {}
