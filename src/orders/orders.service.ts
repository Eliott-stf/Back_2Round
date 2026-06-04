import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { calculateTotal, roundPrice } from '../common/utils/price.utils';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly transactionsService: TransactionsService,
  ) { }

  /**
   * Méthode pour lister toutes les Orders (ADMIN)
   * @return Tab des orders
   */
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Méthode pour afficher mes commandes en tant que Acheteur 
   * @param {string} buyerId Id de l'acheteur
   * @return Liste des commandes incluant les articles, les produits associés (avec médias) et l'adresse de livraison.
   */
  async findMyOrders(buyerId: string) {
    return await this.prisma.order.findMany({
      where: { buyerId }, // <--- CORRECTION ICI
      include: {
        items: {
          include: {
            product: {
              include: { medias: true },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Méthode pour afficher mes vente en tant que vendeur 
   * @param {string} sellerId Id du vendeur
   * @returns Liste des ventes incluant les articles du vendeur, l'adresse et les informations publiques de l'acheteur.
   */
  async findMySales(sellerId: string) {
    return this.prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { sellerId },
          },
        },
      },
      include: {
        items: {
          where: { product: { sellerId } },
          include: { product: { include: { medias: true } } },
        },
        buyer: {
          select: { id: true, name: true, lastname: true, avatarUrl: true },
        },
        shippingAddress: true,
        billingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Méthode pour créer une Order
   */
  async create(buyerId: string, dto: CreateOrderDto) {

    // 1/ On récupére tous les produits commandés. 
    const productIds = dto.items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // 2/ On vérifie que tous les produits existent et sont disponibles
    for (const item of dto.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new NotFoundException(`Produit ${item.productId} introuvable`);
      if (product.status !== 'AVAILABLE') throw new BadRequestException(`Produit ${product.title} non disponible`);
    }

    // 3/ Si une offre a été acceptée on modifie le prix 
    //initialise le prix
    let offerPrice: number | null = null;

    // Vérifie si le dto contient l'ID de l'offre
    if (dto.offerId) {
      // On récup l'offre en bdd
      const offer = await this.prisma.offer.findUnique({
        where: { id: dto.offerId },
        include: { conversation: true },
      });

      //On vérifie que l'offre existe, qu'elle a été acceptée, et que ce soit bien SON offre
      if (!offer) throw new NotFoundException('Offre introuvable');
      if (offer.status !== 'ACCEPTED') throw new BadRequestException('Cette offre n\'est pas acceptée');
      if (offer.conversation.buyerId !== buyerId) throw new ForbiddenException('Accès refusé');

      //On met a jour le prxi avec celui de l'offre
      offerPrice = offer.proposedPrice;
    }

    // On calcule le prix total: prix négocié si offre, sinon prix normal
    const totalAmount = roundPrice(offerPrice ?? calculateTotal(dto.items, products));

    // 4/ On vérifie le solde du wallet acheteur avec walletService 
    const buyerWallet = await this.walletService.checkBalance(buyerId, totalAmount);


    // for (const item of dto.items) {
    //   const product = products.find(p => p.id === item.productId);
    //   if (product.sellerId === buyerId) {
    //     throw new BadRequestException('Vous ne pouvez pas acheter votre propre produit');
    //   }
    // }

    // 5/ On créer l'order en BDD
    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          reference: `2R-${Date.now()}`,
          totalAmount,
          buyerId,
          shippingAddressId: dto.shippingAddressId,
          billingAddressId: dto.billingAddressId,
          status: 'PAID',
          ...(dto.offerId && { offerId: dto.offerId }),
          items: {
            create: dto.items.map(item => {
              const product = products.find(p => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPriceAtPurchase: offerPrice ?? product.price,
              };
            }),
          },
        },
        include: {
          items: { include: { product: true } },
          shippingAddress: true,
          billingAddress: true,
        },
      });

      // ON délégue le debit du wallet de l'acheteur avec walletService
      await this.walletService.debit(tx, buyerId, totalAmount);

      // On crédite le wallet de chaque vendeur si pack multi vendeur 
      for (const item of dto.items) {
        const product = products.find(p => p.id === item.productId)!;
        const amount = roundPrice(offerPrice ?? product.price * item.quantity);

        // ON délégue le crédit du wallet du vendeur avec walletService
        const sellerWallet = await this.walletService.credit(tx, product.sellerId, amount);

        // Délégation de la transaction vendeur en utilisant transactionService
        await this.transactionsService.create(tx, {
          amount,
          type: 'CREDIT',
          description: `Vente : ${product.title}`,
          walletId: sellerWallet.id,
          orderId: order.id,
        });
      }

      // Délégation de la transaction acheteur a transactionService
      await this.transactionsService.create(tx, {
        amount: totalAmount,
        type: 'DEBIT',
        description: `Commande ${order.reference}`,
        walletId: buyerWallet.id,
        orderId: order.id,
      });

      // Passer les produits en vendu 
      await tx.product.updateMany({
        where: { id: { in: productIds } },
        data: { status: 'ARCHIVED' },
      });

      return order;
    });

    return order;
  }

  /**
   * Méthode pour afficher le détail d'un commande 
   * @param {string} userId Id de l'user
   * @param {string} orderId Id de l'order
   * @return La commande complete 
   */
  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { medias: true } },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        buyer: {
          select: { id: true, name: true, lastname: true },
        },
      },
    });

    //On vérifie qu'on l'a trouvée 
    if (!order) throw new NotFoundException('Commande introuvable');

    // On vérifie que l'user est bien l'acheteur ou vendeur de cette commande
    const isBuyer = order.buyerId === userId;
    const isSeller = order.items.some(i => i.product.sellerId === userId);

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('Accès refusé');
    }

    return order;
  }

  /**
   * Méthode pour annulé un commande 
   * @param {string} userId Id de l'user
   * @param {string} orderId Id de la commande
   * @returns L'entité commande mutée avec le statut 'CANCELLED'.
   */
  async cancel(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    //On vérifie si elle existe 
    if (!order) throw new NotFoundException('Commande introuvable');

    //On vérifie que l'user soit l'acheteur de cette commande 
    if (order.buyerId !== userId) throw new ForbiddenException('Accès refusé');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Cette commande ne peut pas être annulée');
    }

    //On met a jour le status 
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
  }
}
