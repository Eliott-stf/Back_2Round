import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Méthode pour créer une transaction
   * appelée lors de la création d'une order
   * @param data 
   * @returns 
   */
  async create(tx: any, data: {
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    walletId: string;
    orderId?: string;
  }) {
    return tx.transaction.create({ data });
  }

  /**
   * Méthode pour lister ses transactions
   * @param {string} userId Id de l'user 
   * @returns Un tab avec la liste des transactions
   */
  async findByUser(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    //Vérif si il existe 
    if (!wallet) throw new NotFoundException('Wallet introuvable');

    return this.prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }

}