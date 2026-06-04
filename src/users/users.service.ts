import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Récupère le profil complet de l'utilisateur connecté
   * @param userId 
   * @returns user
   */
  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      //on récupères son wallet et adresses en plus
      include: {
        addresses: true,
        wallet: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    //On retourne le user sans mdp
    const { password, ...result } = user;
    return result;
  }

  /**
   * Récupère la liste des favoris de l'utilisateur
   * @param userId 
   */
  async findMyFavorites(userId: string) {
    const userWithFavorites = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: {
          include: {
            product: {
              include: {
                medias: true,
                category: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                    lastname: true,
                    avatarUrl: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!userWithFavorites) throw new NotFoundException('Utilisateur introuvable');

    return userWithFavorites.favorites.map(f => f.product);
  }

  /**
   * Récupère le profil d'un autre utilisateur 
   * @param id 
   * @returns user
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      //On selectionne ce que l'on veut afficher 
      select: {
        id: true,
        name: true,
        lastname: true,
        avatarUrl: true,
        boxingType: true,
        createdAt: true,
        // On ne liste que les produits en vente, pas les vendus
        products: {
          where: { status: 'AVAILABLE' },
          include: { medias: true, category: true },
        },
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');
    //on retourne le user 
    return user;
  }

  /**
   * ADMIN : Récupère le profil complet d'un utilisateur pour le BackOffice
   * @param id Id de l'utilisateur
   */
  async findOneForAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        products: {
          include: { medias: true, category: true },
        },
        favorites: {
          include: {
            product: {
              include: {
                medias: true,
                category: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                    lastname: true,
                  }
                }
              }
            }
          }
        },
        addresses: true,
        wallet: true,
      }
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const { password, ...result } = user;
    return result;
  }

  /**
   * Retourne la liste de tous les utilisateurs
   * Pour les ADMIN 
   */
  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });
    return users;
  }

  /**
   * Modifier son profil
   * Le DTO définit quels champs sont modifiables.
   * @param userId
   * @returns user
   */
  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        lastname: dto.lastname,
        weight: dto.weight,
        height: dto.height,
        boxingType: dto.boxingType,
      },
    });

    //On retourne l'utilisateur sans mdp

    const { password, ...result } = user;
    return result;
  }

  /**
   * Supprime définitivement l'utilisateur de la base de données
   * @param userId 
   */
  async deleteMe(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { message: 'Compte supprimé avec succès' };
  }

  /**
   * Méthode pour activer/désactiver un compte (Toggle BAN)
   * Pour les ADMIN 
   * @param adminId userId 
   * @param userId 
   */
  async ban(adminId: string, userId: string) {
    //On vérifie que l'admin se ban pas lui meme....
    if (adminId === userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier votre propre statut');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new NotFoundException('Utilisateur introuvable');

    // On inverse le statut actuel
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !targetUser.isActive },
    });

    const { password, ...result } = user;
    return result;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    const { password, ...result } = user;
    return result;
  }

}