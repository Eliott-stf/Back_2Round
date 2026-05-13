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
   * Méthode pour désactiver un compte (BAN)
   * Pour les ADMIN 
   * @param adminId userId 
   * @returns result
   */
  async ban(adminId: string, userId: string) {
    //On vérifie que l'admin se ban pas lui meme....
    if (adminId === userId) {
      throw new ForbiddenException('Vous ne pouvez pas vous bannir vous-même');
    }

    //On false isActive sur l'user
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    const { password, ...result } = user;
    return result;
  }

}