import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Méthode pour récupèrer la liste des conversations de l'user
   * @param {string} userId Id de l'utilisateur
   * @returns {Promise<Array<object>>} Liste des conversations triées par activité récente
   */
  async findAll(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { product: { sellerId: userId } },
        ],
      },
      include: {
        product: { include: { medias: true } },
        buyer: {
          select: { name: true, lastname: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        offers: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Méthode pour afficher le détail d'une conversation
   * @param {string} userId id de l'user
   * @param {string} conversationId Id de la conv
   * @returns {Promise<object>} L'entité conversation avec messages et offres
   * @throws {ForbiddenException} Si l'utilisateur n'appartient pas à la conversation
   */
  async findOne(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        product: {
          include: {
            medias: true,
            seller: {
              select: { name: true, lastname: true, avatarUrl: true },
            },
          },
        },
        buyer: {
          select: { name: true, lastname: true, avatarUrl: true },
        },
        messages: { orderBy: { createdAt: 'asc' } },
        offers: { orderBy: { createdAt: 'desc' } },
      },
    });

    //Si la conversation n'existe pas
    if (!conversation) throw new NotFoundException('Conversation introuvable');
    
    const isBuyer = conversation.buyerId === userId;
    const isSeller = conversation.product.sellerId === userId;

    //Si l'user n'appartient pas a la conv
    if (!isBuyer && !isSeller) throw new ForbiddenException('Accès refusé');

    return conversation;
  }

  /**
   * Méthode pour créer un conversation 
   * @param {string} buyerId  Id de l'acheteur
   * @param {CreateConversationDto} dto  Id du produit 
   * @returns L'entité conversation
   */
  async create(buyerId: string, dto: CreateConversationDto) {
    
    //On va chercher le product avec son id en bdd
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    //Validator exist/dispo/unique
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.status !== 'AVAILABLE') throw new BadRequestException('Produit non disponible');
    if (product.sellerId === buyerId) throw new BadRequestException('Vous ne pouvez pas vous contacter vous-même');

    //On regarde si la conv existe pas déja 
    const existing = await this.prisma.conversation.findUnique({
      where: { productId_buyerId: { productId: dto.productId, buyerId } },
    });

    //ON retourne la conv existante 
    if (existing) return existing;

    //SInon on créer la conv en bdd
    return this.prisma.conversation.create({
      data: { productId: dto.productId, buyerId },
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, name: true, lastname: true, avatarUrl: true },
            },
          },
        },
      },
    });
  }
}
