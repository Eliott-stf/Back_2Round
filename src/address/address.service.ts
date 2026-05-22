import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Vérifie que l'adresse appartient bien à l'utilisateur
   * @param {string} userId Id de l'utilisateur
   * @param {string} addressId Id de l'adresse
   * @returns {Promise<object>} L'adresse si la validation réussit
   */
  private async checkOwnership(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) throw new NotFoundException('Adresse introuvable');
    if (address.userId !== userId) throw new ForbiddenException('Cette adresse ne vous appartient pas');

    return address;
  }

  /**
   * Crée une nouvelle adresse pour l'utilisateur connecté
   * @param {string} userId Id de l'utilisateur
   * @param {CreateAddressDto} dto Données de l'adresse à créer
   * @returns {Promise<object>} L'adresse créée
   */
  async create(userId: string, dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  /**
   * Récupère toutes les adresses de l'utilisateur connecté
   * @param {string} userId Id de l'utilisateur
   * @returns {Promise<object[]>} Liste des adresses
   */
  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { type: 'asc' },
    });
  }

  /**
   * Récupère le détail d'une adresse
   * @param {string} userId Id de l'utilisateur
   * @param {string} id Id de l'adresse
   * @returns {Promise<object>} L'adresse correspondante
   */
  async findOne(userId: string, id: string) {
    return this.checkOwnership(userId, id);
  }

  /**
   * Modifie une adresse existante de l'utilisateur connecté
   * @param {string} userId Id de l'utilisateur
   * @param {string} id Id de l'adresse
   * @param {UpdateAddressDto} dto Données à mettre à jour
   * @returns {Promise<object>} L'adresse mise à jour
   */
  async update(userId: string, id: string, dto: UpdateAddressDto) {
    await this.checkOwnership(userId, id);

    return this.prisma.address.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprime une adresse de l'utilisateur connecté
   * @param {string} userId Id de l'utilisateur
   * @param {string} id Id de l'adresse
   * @returns {Promise<{message: string}>} Message de confirmation
   */
  async remove(userId: string, id: string) {
    await this.checkOwnership(userId, id);

    await this.prisma.address.delete({ where: { id } });
    return { message: 'Adresse supprimée avec succès' };
  }

}