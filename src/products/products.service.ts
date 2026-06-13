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
  /**
   * Helper pour charger virtuellement les sous-produits d'un pack à partir du tag [PACK:id1,id2,...] dans sa description
   */
  private async populateVirtualPack(product: any) {
    if (!product) return product;

    const match = product.description?.match(/\[PACK:([^\]]+)\]/);
    if (match && match[1]) {
      const ids = match[1].split(',').map((id: string) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        const subProducts = await this.prisma.product.findMany({
          where: { id: { in: ids } },
          include: {
            medias: true,
            category: true,
          },
        });
        product.isPack = true;
        product.subProducts = subProducts;
        product.packProducts = subProducts.map((p: any) => ({ product: p }));
        return product;
      }
    }

    product.isPack = false;
    product.subProducts = [];
    product.packProducts = [];
    return product;
  }

  private async populateVirtualPacks(products: any[]) {
    return Promise.all(products.map(p => this.populateVirtualPack(p)));
  }

  /**
   * Récupère une liste paginée de produits selon le filtrage
   * @param {FilterProductDto} filters dto avec les critères de recherche (texte, catégorie, état, prix) et pagination.
   * @returns Un objet contenant les produits correspondants
   */
  async findAll(filters: FilterProductDto) {
    const { search, categoryId, attributeId, condition, minPrice, maxPrice, page = 1, limit = 20, sellerId, status } = filters;

    const where: any = {
      status: status ? status : (sellerId ? { in: ['AVAILABLE', 'ARCHIVED'] } : 'AVAILABLE'),
      ...(sellerId && { sellerId }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(attributeId && {
        attributes: {
          some: {
            attributeId
          }
        }
      }),
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
          attributes: {
            include: {
              attribute: true
            }
          },
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

    const populatedProducts = await this.populateVirtualPacks(products);

    return {
      data: populatedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * ADMIN : Récupère absolument tous les produits pour le BackOffice
   */
  async findAllForAdmin() {
    const products = await this.prisma.product.findMany({
      include: {
        medias: true,
        category: true,
        attributes: {
          include: {
            attribute: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const populatedProducts = await this.populateVirtualPacks(products);
    return { data: populatedProducts };
  }

  /**
   * ADMIN : Bascule le statut d'un produit (ARCHIVED <-> AVAILABLE)
   * On ne touche pas au statut PENDING ici, sauf si vous voulez le forcer.
   */
  async toggleAdminArchive(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produit introuvable');

    const newStatus = product.status === 'ARCHIVED' ? 'AVAILABLE' : 'ARCHIVED';

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { status: newStatus },
      include: {
        medias: true,
        category: true,
        attributes: {
          include: {
            attribute: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    const populated = await this.populateVirtualPack(updated);
    return { data: populated };
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
        attributes: {
          select: {
            attribute: true
          }
        },
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
        attributes: {
          include: {
            attribute: true
          }
        },
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
    return this.populateVirtualPack(product);
  }

  /**
   * Méthode pour créer un produit
   * @param {string} userId Id de l'user (vendeur)
   * @param {CreateProductDto} dto Objet de transfert de données contenant les informations du produit.
   * @returns {Promise<{message: string}>} Un objet contenant un message de succès.
   */
  async create(userId: string, dto: CreateProductDto) {
    const { attributeIds, ...rest } = dto;
    const product = await this.prisma.product.create({
      data: {
        title: rest.title,
        description: rest.description,
        condition: rest.condition,
        price: rest.price,
        sellerId: userId,
        categoryId: rest.categoryId,
      },
    });

    if (attributeIds && attributeIds.length > 0) {
      await this.prisma.productAttribute.createMany({
        data: attributeIds.map(attrId => ({
          productId: product.id,
          attributeId: attrId
        }))
      });
    }

    const fullProduct = await this.prisma.product.findUnique({
      where: { id: product.id },
      include: {
        medias: true,
        category: true,
        attributes: {
          include: {
            attribute: true
          }
        }
      }
    });

    // Gestion du pack virtuel : passer les sous-produits au statut PENDING
    const match = rest.description?.match(/\[PACK:([^\]]+)\]/);
    if (match && match[1]) {
      const ids = match[1].split(',').map((id: string) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        await this.prisma.product.updateMany({
          where: {
            id: { in: ids },
            sellerId: userId,
          },
          data: {
            status: 'PENDING',
          },
        });
      }
    }

    return this.populateVirtualPack(fullProduct);
  }

  /**
   * Méthode pour modifier un product 
   * @param userId Id de l'user
   * @param productId Id du produit 
   * @param UpdateProductDto Validator 
   * @return message
   */
  async update(userId: string, productId: string, dto: UpdateProductDto) {
    const { attributeIds, ...rest } = dto;

    //On vérifie que l'user modifie SON produit 
    await this.checkOwnership(userId, productId);

    await this.prisma.product.update({
      where: { id: productId },
      data: rest,
    });

    if (attributeIds) {
      await this.prisma.productAttribute.deleteMany({
        where: { productId }
      });

      if (attributeIds.length > 0) {
        await this.prisma.productAttribute.createMany({
          data: attributeIds.map(attrId => ({
            productId,
            attributeId: attrId
          }))
        });
      }
    }

    const fullProduct = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        medias: true,
        category: true,
        attributes: {
          include: {
            attribute: true
          }
        }
      }
    });

    return this.populateVirtualPack(fullProduct);
  }

  /**
   * Méthode pour supprimer MON product 
   * @param productId 
   * @returns message
   */
  async remove(userId: string, productId: string) {

    //On vérifie que l'user supprime SON produit 
    await this.checkOwnership(userId, productId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (product) {
      const match = product.description?.match(/\[PACK:([^\]]+)\]/);
      if (match && match[1]) {
        const ids = match[1].split(',').map((id: string) => id.trim()).filter(Boolean);
        if (ids.length > 0) {
          // Restaurer les sous-produits à AVAILABLE
          await this.prisma.product.updateMany({
            where: {
              id: { in: ids },
              sellerId: userId,
            },
            data: {
              status: 'AVAILABLE',
            },
          });
        }
      }
    }

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