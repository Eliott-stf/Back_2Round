import { Module } from '@nestjs/common';
import { BankAccountsController } from './bank-account.controller';
import { BankAccountsService } from './bank-account.service';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
})
export class BankAccountModule {}
