import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Méthode pour lister tout les avis d'un user
   * @param {string} userId Id du vendeur
   * @returns {Promise<Array<object>>} Liste des avis incluant les détails de la commande et le profil de l'acheteur
   */
  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: {
        order: {
          items: {
            some: { product: { sellerId: userId } },
          },
        },
      },
      include: {
        order: {
          include: {
            buyer: {
              select: { id: true, name: true, lastname: true, avatarUrl: true },
            },
            items: {
              include: { product: { select: { title: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Méthode pour récupérer l'avis d'une commande spécifique
   * @param {string} orderId Id de la commande
   * @returns {Promise<object | null>} L'avis incluant les détails de l'acheteur
   */
  async findByOrder(orderId: string) {
    return this.prisma.review.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            buyer: {
              select: { id: true, name: true, lastname: true, avatarUrl: true },
            },
            items: {
              include: { product: { select: { title: true } } },
            },
          },
        },
      },
    });
  }

  /**
   * M2thode pour créer une reviews
   * @param {string} buyerId id du vendeur 
   * @param {string} orderId Id de la commande
   * @param {CreateReviewDto} dto  Objet contenant la note et le commentaire
   * @returns {Promise<object>} L'entité avis créée
   * @throws {NotFoundException} Si la commande est inexistante
   * @throws {ForbiddenException} Si l'utilisateur n'est pas l'acheteur de la commande
   * @throws {BadRequestException} Si la commande n'est pas au statut 'PAID' ou si un avis a déjà été émis
   */
  async create(buyerId: string, orderId: string, dto: CreateReviewDto) {

    //On récupère la commande en Bdd avec son Id
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true },
    });

    //On vérifie que la commande existe 
    if (!order) throw new NotFoundException('Commande introuvable');
    //On vérifie que la l'user n'est pas le vendeur
    if (order.buyerId !== buyerId) throw new ForbiddenException('Accès refusé');
    //On vérifie que la commande a vien été passée
    if (order.status !== 'PAID') throw new BadRequestException('Commande non finalisée');
    //On vérifie que la commande n'a pas déja de review (comme c'est unique, il peut y avoir que 1 review)
    if (order.review) throw new BadRequestException('Un avis existe déjà pour cette commande');

    //On créer notre review en Bdd
    return this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        orderId,
      },
    });
  }

  /**
   * Méthode pour supprimer un avis 
   * @param {string} buyerId Id de l'acheteur
   * @param {string} reviewId Id de la review
   * @returns {Promise<{message: string}>} Message
   * @throws {NotFoundException} Si l'avis est inexistant
   * @throws {ForbiddenException} Si l'utilisateur n'est pas l'auteur de l'avis via la commande associée
   */
  async remove(buyerId: string, reviewId: string) {

    //On va chercher la review en bdd
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { order: true },
    });

    //On vérifie qu'elle existe 
    if (!review) throw new NotFoundException('Avis introuvable');
    //On vérife que c'est bien l'auteur de l'avis
    if (review.order.buyerId !== buyerId) throw new ForbiddenException('Accès refusé');

    //On delete la review en bdd
    await this.prisma.review.delete({ where: { id: reviewId } });
    return { message: 'Avis supprimé' };
  }
}