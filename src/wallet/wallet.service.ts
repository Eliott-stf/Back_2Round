import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Méthode utils pour vérifier que le wallet a le solde suffisant
   * Appelée dans la création du commande
   * @param {string} userId Id de l'user
   * @param {number} amount Montant requis
   * @returns {Promise<object>} L'entité portefeuille validée
   * @throws {NotFoundException} Si le portefeuille est inexistant
   * @throws {BadRequestException} Si le solde disponible est inférieur au montant requis
   */
  async checkBalance(userId: string, amount: number) {
    //On récupère son wallet en bdd
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    //On vérifie qu'il existe et qu'il a les fonds necessaire
    if (!wallet) throw new NotFoundException('Wallet introuvable');
    if (wallet.balance < amount) throw new BadRequestException('Solde insuffisant');

    return wallet;
  }

  /**
   * Méthode pour créer un wallet
   * Exécuté automatiquement lors de la création d'un compte utilisateur (AuthService)
   * @param {string} userId Id de l'user
   * @returns {Promise<object>} L'entité portefeuille créée
   */
  async create(userId: string) {
    return this.prisma.wallet.create({
      data: {
        balance: 0,
        userId,
      },
    });
  }

  /**
   * Méthode pour voir mon wallet
   * @param {string} userId Id de l'utilisateur.
   * @returns {Promise<object>} Le portefeuille incluant les 10 dernières transactions
   * @throws {NotFoundException} Si aucun portefeuille n'est associé à l'utilisateur
   */
  async findByUser(userId: string) {
    //On récupère le wallet de l'user en bdd
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        //On récupère ses 10 dernieres transactions
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    //On vérifie que le wallet existe bien
    if (!wallet) throw new NotFoundException('Wallet introuvable');
    return wallet;
  }

  /**
   * Méthode pour débiter un wallet
   * Appelée lors d'une création d'une commande
   * @param {any} tx Instance de la transaction 
   * @param {string} userId Id de l'user a debiter
   * @param {number} amount Somme à déduire
   * @returns {Promise<object>} L'entité portefeuille mise à jour
   */
  async debit(tx: any, userId: string, amount: number) {
    return tx.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });
  }

  /**
   * Méthode pour créditer un wallet
   * Appelée lors d'une création d'une commande
   * @param {any} tx Instance de la transaction 
   * @param {string} userId Id de l'user a créditer
   * @param {number} amount Somme à déduire
   * @returns {Promise<object>} L'entité portefeuille mise à jour
   */
  async credit(tx: any, userId: string, amount: number) {
    return tx.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });
  }

}
