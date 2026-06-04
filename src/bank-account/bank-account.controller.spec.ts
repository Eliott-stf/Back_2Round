import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountsController } from './bank-account.controller';
import { BankAccountsService } from './bank-account.service';

describe('BankAccountController', () => {
  let controller: BankAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankAccountsController],
      providers: [BankAccountsService],
    }).compile();

    controller = module.get<BankAccountsController>(BankAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
