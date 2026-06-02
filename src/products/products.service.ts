import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Méthode util privée pour valider que le produit appartient bien a l'user
   * @param {string} userId Id de l'user
   * @param {string} productId id du produit
   * @returns {Promise<object>} L'objet produit si la validation réussit.
   */
  private async checkOwnership(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    //On vérifie qu'on a bien un produit
    if (!product) throw new NotFoundException('Produit introuvable');

    //On vérifie que le produit appartient bien a l'utilisateur 
    if (product.sellerId !== userId) {
      throw new ForbiddenException('Ce produit ne vous appartient pas');
    }

    return product;
  }

  /**
   * Récupère une liste paginée de produits selon le filtrage
   * @param {FilterProductDto} filters dto avec les critères de recherche (texte, catégorie, état, prix) et pagination.
   * @returns Un objet contenant les produits correspondants
   */
  async findAll(filters: FilterProductDto) {
    const { search, categoryId, condition, minPrice, maxPrice, page = 1, limit = 20, sellerId } = filters;

    const where: any = {
      ...(sellerId
        ? { sellerId, status: { in: ['AVAILABLE', 'ARCHIVED'] } }
        : { status: 'AVAILABLE' }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(condition && { condition }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      }),
    };

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          medias: true,
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              lastname: true,
              avatarUrl: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Méthode pour avoir la liste des products
   * @returns Tableau contenant les produits
   */
  async findALl() {
    const products = await this.prisma.product.findMany({
      select: {
        title: true,
        description: true,
        condition: true,
        size: true,
        price: true,
        updatedAt: true,
      },
    });
    //on retourne les produits 
    return products
  }

  /**
   * Méthode pour avoir le detail d'un produit
   * @param {string} id  Id du product 
   * @returns le produit
   */
  // Détail produit
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        medias: true,
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            lastname: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    //Si le produit n'est pas trouvé on throw une erreur 
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  /**
   * Méthode pour créer un produit
   * @param {string} userId Id de l'user (vendeur)
   * @param {CreateProductDto} dto Objet de transfert de données contenant les informations du produit.
   * @returns {Promise<{message: string}>} Un objet contenant un message de succès.
   */
  async create(userId: string, dto: CreateProductDto) {
    return await this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        condition: dto.condition,
        size: dto.size,
        price: dto.price,
        sellerId: userId,
        categoryId: dto.categoryId,
      },
      include: {
        medias: true,
        category: true,
      },
    });
  }

  /**
   * Méthode pour modifier un product 
   * @param userId Id de l'user
   * @param productId Id du produit 
   * @param UpdateProductDto Validator 
   * @return message
   */
  async update(userId: string, productId: string, dto: UpdateProductDto) {

    //On vérifie que l'user modifie SON produit 
    await this.checkOwnership(userId, productId);

    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
      include: { medias: true, category: true },
    });
  }

  /**
   * Méthode pour supprimer MON product 
   * @param productId 
   * @returns message
   */
  async remove(userId: string, productId: string) {

    //On vérifie que l'user supprime SON produit 
    await this.checkOwnership(userId, productId);

    await this.prisma.product.delete({ where: { id: productId } });
    return { message: 'Produit supprimé avec succès' };
  }

  /**
   * Méthode pour mettre en favori un produit
   * @param {string} userId Id de l'user
   * @param {string} productId Id du produit
   * @returns {Promise<{message: string}>} Un message
   */
  async toggleFavorite(userId: string, productId: string) {
    const existing = await this.prisma.userProduct.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    //Si le couple UserId_ProductId existe déja, on le supprime (toggle)
    if (existing) {
      await this.prisma.userProduct.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { message: 'Retiré des favoris' };
    }

    //Sinon on créer en bdd 
    await this.prisma.userProduct.create({
      data: { userId, productId },
    });
    return { message: 'Ajouté aux favoris' };
  }

}