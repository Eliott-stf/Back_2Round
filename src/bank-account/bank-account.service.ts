import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Vérifie que le compte bancaire appartient bien à l'utilisateur
   * @param {string} userId Id de l'utilisateur
   * @param {string} bankAccountId Id du compte bancaire
   * @returns {Promise<object>} Le compte bancaire si la validation réussit
   */
  private async checkOwnership(userId: string, bankAccountId: string) {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount) throw new NotFoundException('Compte bancaire introuvable');
    if (bankAccount.userId !== userId) throw new ForbiddenException('Ce compte ne vous appartient pas');

    return bankAccount;
  }

  /**
   * Masque l'IBAN pour l'affichage en liste
   * @param {string} iban IBAN complet
   * @returns {string} IBAN masqué ex: FR76 **** **** **** 1234
   */
  private maskIban(iban: string): string {
    const start = iban.slice(0, 4);
    const end = iban.slice(-4);
    return `${start} **** **** **** ${end}`;
  }

  /**
   * Crée un nouveau compte bancaire pour l'utilisateur connecté
   * @param {string} userId Id de l'utilisateur
   * @param {CreateBankAccountDto} dto Données du compte bancaire
   * @returns {Promise<object>} Le compte bancaire créé
   */
  async create(userId: string, dto: CreateBankAccountDto) {
    // Si isDefault → on retire le default des autres comptes
    if (dto.isDefault) {
      await this.prisma.bankAccount.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.bankAccount.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  /**
   * Récupère tous les comptes bancaires de l'utilisateur avec IBAN masqué
   * @param {string} userId Id de l'utilisateur
   * @returns {Promise<object[]>} Liste des comptes bancaires
   */
  async findAll(userId: string) {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    // On masque l'IBAN pour la liste
    return accounts.map(account => ({
      ...account,
      iban: this.maskIban(account.iban),
    }));
  }

  /**
   * Récupère le détail d'un compte bancaire avec IBAN complet
   * @param {string} userId Id de l'utilisateur
   * @param {string} id Id du compte bancaire
   * @returns {Promise<object>} Le compte bancaire avec IBAN complet
   */
  async findOne(userId: string, id: string) {
    return this.checkOwnership(userId, id);
  }

  /**
   * Modifie un compte bancaire existant
   * @param {string} userId Id de l'utilisateur
   * @param {string} id Id du compte bancaire
   * @param {UpdateBankAccountDto} dto Données à mettre à jour
   * @returns {Promise<object>} Le compte bancaire mis à jour
   */
  async update(userId: string, id: string, dto: UpdateBankAccountDto) {
    await this.checkOwnership(userId, id);

    return this.prisma.bankAccount.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprime un compte bancaire
   * @param {string} userId Id de l'utilisateur
   * @param {string} id Id du compte bancaire
   * @returns {Promise<{message: string}>} Message de confirmation
   */
  async remove(userId: string, id: string) {
    await this.checkOwnership(userId, id);

    await this.prisma.bankAccount.delete({ where: { id } });
    return { message: 'Compte bancaire supprimé avec succès' };
  }

  /**
   * Définit un compte bancaire comme compte par défaut
   * @param {string} userId Id de l'utilisateur
   * @param {string} id Id du compte bancaire à définir par défaut
   * @returns {Promise<object>} Le compte bancaire mis à jour
   */
  async setDefault(userId: string, id: string) {
    await this.checkOwnership(userId, id);

    // On retire le default de tous les comptes
    await this.prisma.bankAccount.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // On set le default sur le compte choisi
    return this.prisma.bankAccount.update({
      where: { id },
      data: { isDefault: true },
    });
  }

}