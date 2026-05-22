import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountsService } from './bank-account.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Auth } from '../common/decorators/auth.decorator';


@Controller('bank-accounts')
export class BankAccountsController {

  constructor(private readonly bankAccountsService: BankAccountsService) {}

  /**
   * POST /bank-accounts
   * Ajouter un compte bancaire
   * @Auth Seul un utilisateur connecté peut ajouter un compte bancaire
   */
  @Post()
  @Auth()
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateBankAccountDto,
  ) {
    return this.bankAccountsService.create(user.id, dto);
  }

  /**
   * GET /bank-accounts
   * Lister mes comptes bancaires avec IBAN masqué
   * @Auth Seul un utilisateur connecté peut voir ses comptes
   */
  @Get()
  @Auth()
  findAll(@CurrentUser() user: any) {
    return this.bankAccountsService.findAll(user.id);
  }

  /**
   * GET /bank-accounts/:id
   * Détail d'un compte bancaire avec IBAN complet
   * @Auth Seul un utilisateur connecté peut voir ses comptes
   * @param id Id du compte bancaire
   */
  @Get(':id')
  @Auth()
  findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankAccountsService.findOne(user.id, id);
  }

  /**
   * PATCH /bank-accounts/:id
   * Modifier un compte bancaire
   * @Auth Seul un utilisateur connecté peut modifier ses comptes
   * @param id Id du compte bancaire
   */
  @Patch(':id')
  @Auth()
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(user.id, id, dto);
  }

  /**
   * PATCH /bank-accounts/:id/default
   * Définir un compte bancaire comme compte par défaut
   * @Auth Seul un utilisateur connecté peut modifier ses comptes
   * @param id Id du compte bancaire
   */
  @Patch(':id/default')
  @Auth()
  setDefault(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankAccountsService.setDefault(user.id, id);
  }

  /**
   * DELETE /bank-accounts/:id
   * Supprimer un compte bancaire
   * @Auth Seul un utilisateur connecté peut supprimer ses comptes
   * @param id Id du compte bancaire
   */
  @Delete(':id')
  @Auth()
  remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankAccountsService.remove(user.id, id);
  }

}