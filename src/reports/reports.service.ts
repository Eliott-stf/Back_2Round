import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {

  constructor(private prisma: PrismaService) { }

  /**
   * Méthode pour créer un signalement
   * @param {string} userId Id de l'utilisateur qui signale
   * @param {CreateReportDto} dto Données du signalement
   * @returns {Promise<any>} Le signalement créé
   * @throws {BadRequestException} Si ni productId ni conversationId ne sont fournis, ou si les deux le sont
   */
  async create(userId: string, dto: CreateReportDto) {

    //On vérifie que le signalement est effectué sur une conv ou un produit
    if (!dto.productId && !dto.conversationId) {
      throw new BadRequestException('Le signalement doit cibler un produit ou une conversation.');
    }

    //On vérifie que le signalement cible pas les 2
    if (dto.productId && dto.conversationId) {
      throw new BadRequestException('Un signalement ne peut pas cibler simultanément un produit et une conversation.');
    }

    //On créer le report en Bdd
    return this.prisma.report.create({
      data: {
        userId,
        content: dto.content,
        productId: dto.productId,
        conversationId: dto.conversationId,
        typeReportId: dto.typeReportId,
      },
    });
  }

  /**
   * Méthode pour lister tous les signalements (ADMIN)
   * @returns {Promise<any[]>} Liste de tous les signalements
   */
  async findAll() {
    return this.prisma.report.findMany({
      include: {
        user: true,
        typeReport: true,
        product: true,
        conversation: true,
      },
    });
  }

  /**
   * Méthode pour afficher le détail d'un signalement (ADMIn)
   * @param {string} id Id du signalement
   * @returns {Promise<any>} Détail du signalement
   * @throws {NotFoundException} Si le signalement est introuvable
   */
  async findOne(id: string) {
    //On cherche le report avec son id
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        user: true,
        typeReport: true,
        product: true,
        conversation: true,
      },
    });

    //On vérifie qu'il existe bien
    if (!report) {
      throw new NotFoundException(`Signalement introuvable`);
    }

    //On renvoit le signalement
    return report;
  }

  /**
   * Méthode pour lister les signalements d'un utilisateur (ADMIN)
   * @param {string} userId Id de l'utilisateur
   * @returns {Promise<any[]>} Liste des signalements de l'utilisateur
   */
  async findMine(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      include: {
        typeReport: true,
        product: true,
        conversation: true,
      },
    });
  }

  /**
   * Méthode pour marquer un signalement comme résolu (ADMIN)
   * @param {string} adminId Id de l'administrateur
   * @param {string} id Id du signalement à résoudre
   * @returns {Promise<any>} Le signalement mis à jour
   * @throws {NotFoundException} Si le signalement est introuvable
   */
  async resolve(adminId: string, id: string) {
    //On récupère le signalement 
    const report = await this.prisma.report.findUnique({ where: { id } });

    //On vérifie que le signalement existe
    if (!report) {
      throw new NotFoundException(`Signalement introuvable`);
    }

    //On met a jour le status du report
    return this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });
  }
}