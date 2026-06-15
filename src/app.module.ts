import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { OffersModule } from './offers/offers.module';
import { WalletModule } from './wallet/wallet.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReportsModule } from './reports/reports.module';
import { MediaModule } from './media/media.module';
import { TypeReportsModule } from './type-reports/type-reports.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AddressModule } from './address/address.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PaymentsModule } from './payments/payments.module';
import { FacturesModule } from './factures/factures.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AttributesModule } from './attributes/attributes.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 300,
    }]),
    PrismaModule, UsersModule, AuthModule, ProductsModule, CategoriesModule, OrdersModule, OffersModule, WalletModule, ConversationsModule, MessagesModule, ReviewsModule, ReportsModule, MediaModule, TypeReportsModule, TransactionsModule, AddressModule, BankAccountModule, PaymentsModule, FacturesModule, WebsocketModule, AttributesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
