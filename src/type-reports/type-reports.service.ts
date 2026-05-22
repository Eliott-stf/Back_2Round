import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTypeReportDto } from './dto/create-type-report.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TypeReportsService {

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Méthode pour lister les types de signalement
   * @returns {Promise<TypeReport[]>} Liste des types de signalement
   */
  async findAllTypeReports() {
    return this.prisma.typeReport.findMany({
      orderBy: { label: 'asc' },
    });
  }

  /**
   * Méthode pour créer un type de signalement (ADMIN)
   * @param {CreateTypeReportDto} dto Données du type de signalement
   * @returns {Promise<TypeReport>} Type de signalement créé
   * @throws {ConflictException} Si le label existe déjà
   */
  async createTypeReport(dto: CreateTypeReportDto) {

    //On vérifie que le type n'existe pas déjà
    const existing = await this.prisma.typeReport.findUnique({
      where: { label: dto.label },
    });

    if (existing) {
      throw new ConflictException(
        `Un type de signalement avec le label "${dto.label}" existe déjà`,
      );
    }

    //Sinon on créer le typeReport en Bdd
    return this.prisma.typeReport.create({
      data: { label: dto.label },
    });
  }

  /**
   * Méthode pour supprimer un type de signalement
   * @param {string} id Id du type de signalement
   * @returns {Promise<{message: string}>} Message de confirmation
   * @throws {NotFoundException} Si le type de signalement est inexistant
   */
  async deleteTypeReport(id: string) {
    //On cherche le typeReport avec son ID 
    const typeReport = await this.prisma.typeReport.findUnique({
      where: { id },
    });

    //On vérifie qu'il existe
    if (!typeReport) {
      throw new NotFoundException(`Type de signalement introuvable`);
    }

    //On le delete en Bdd
    await this.prisma.typeReport.delete({ where: { id } });

    return { message: 'Type de signalement supprimé avec succès' };
  }
}
