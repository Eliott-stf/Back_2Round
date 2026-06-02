import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { OrdersModule } from '../orders/orders.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [OrdersModule, WalletModule, TransactionsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService],
  exports: [StripeService],
})
export class PaymentsModule { }