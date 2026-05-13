import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('transactions')
export class TransactionsController {

  constructor(private readonly transactionsService: TransactionsService) {}

  // GET /transactions 
  /**
   * Liste mes transactions
   * @param {string} user 
   * @Auth Utilisateur authentifié 
   */
  @Get()
  @Auth()
  findByUser(@CurrentUser() user: any) {
    return this.transactionsService.findByUser(user.id);
  }

}