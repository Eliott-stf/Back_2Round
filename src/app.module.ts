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

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ProductsModule, CategoriesModule, OrdersModule, OffersModule, WalletModule, ConversationsModule, MessagesModule, ReviewsModule, ReportsModule, MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
