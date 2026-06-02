import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  /**
   * GET /wallet/me
   * Récupère le wallet de l'utilisateur connecté avec son historique de transactions
   * @Auth Utilisateur authentifié
   */
  @Get('me')
  @Auth()
  findMine(@CurrentUser() user: any) {
    return this.walletService.findByUser(user.id);
  }
}