import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Méthode pour faire une offre
   * @param {string} buyerId Id de l'acheteur  
   * @param {CreateOfferDto} dto DTO pour la création
   * @returns L'entité offre créée avec le statut 'PENDING'.
   */
  async create(buyerId: string, dto: CreateOfferDto) {
    //On extrait le produit concerné par l'offre
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    //On vérifie que le product existe/disponible et que c'est pas son product
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.status !== 'AVAILABLE') throw new BadRequestException('Produit non disponible');
    if (product.sellerId === buyerId) throw new BadRequestException('Vous ne pouvez pas faire une offre sur votre propre produit');

    // On vérifie qu'une offre PENDING n'existe pas déjà
    const existing = await this.prisma.offer.findFirst({
      where: {
        productId: dto.productId,
        conversationId: dto.conversationId,
        status: 'PENDING',
      },
    });

    if (existing) throw new BadRequestException('Une offre est déjà en attente sur ce produit');

    //on créer en bdd
    return this.prisma.offer.create({
      data: {
        proposedPrice: dto.proposedPrice,
        productId: dto.productId,
        conversationId: dto.conversationId,
      },
    });
  }

  /**
   *  Méthode pour récuperer l'offre recue (Vendeur)
   * @param {string} sellerId Id du vendeur
   * @returns } Tableau des offres
   */
  async findReceived(sellerId: string) {
    return this.prisma.offer.findMany({
      where: {
        product: { sellerId },
      },
      include: {
        product: { include: { medias: true } },
        conversation: {
          include: {
            buyer: {
              select: { id: true, name: true, lastname: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Méthode pour récup les offres envoyées (Acheteur)
   * @param {string} buyerId Id de l'acheteur 
   * @returns } Tableau des offres
   */
  async findSent(buyerId: string) {
    return this.prisma.offer.findMany({
      where: {
        conversation: { buyerId },
      },
      include: {
        product: { include: { medias: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Méthode pour accepter une offre (Vendeur)
   * @param {string} sellerId Id du vendeur
   * @param {string} offerId  Id de l'offre
   * @returns L'entité offre avec le statut 'ACCEPTED'.
   */
  async accept(sellerId: string, offerId: string) {
    const offer = await this.findOfferAndCheckSeller(sellerId, offerId);

     //On vérifie que l'offre est toujours d'actualité 
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Cette offre ne peut plus être acceptée');
    }

    return this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    });
  }

  /**
   * Méthode pour décliner une offre (Vendeur)
   * @param {string} sellerId Id du vendeur
   * @param {string} offerId  Id de l'offre
   * @returns L'entité offre avec le statut 'DECLINED'.
   */
  async reject(sellerId: string, offerId: string) {
    const offer = await this.findOfferAndCheckSeller(sellerId, offerId);

    //On vérifie que l'offre est toujours d'actualité 
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Cette offre ne peut plus être refusée');
    }

    return this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'DECLINED' },
    });
  }


  // Util privé — vérifie que le vendeur est bien proprio du produit lié à l'offre
  private async findOfferAndCheckSeller(sellerId: string, offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { product: true },
    });

    if (!offer) throw new NotFoundException('Offre introuvable');
    if (offer.product.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');

    return offer;
  }

}
