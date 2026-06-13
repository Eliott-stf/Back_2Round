import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère la liste de tous les attributs triés par type et valeur
   */
  async findAll() {
    return this.prisma.attribute.findMany({
      orderBy: [
        { type: 'asc' },
        { value: 'asc' }
      ]
    });
  }

  /**
   * Récupère un attribut par son ID
   */
  async findOne(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id }
    });

    if (!attribute) {
      throw new NotFoundException('Attribut introuvable');
    }

    return attribute;
  }

  /**
   * Crée un nouvel attribut (Admin)
   */
  async create(dto: CreateAttributeDto) {
    const exists = await this.prisma.attribute.findUnique({
      where: {
        type_value: {
          type: dto.type,
          value: dto.value
        }
      }
    });

    if (exists) {
      throw new ConflictException('Cet attribut existe déjà');
    }

    return this.prisma.attribute.create({
      data: {
        type: dto.type,
        value: dto.value
      }
    });
  }

  /**
   * Modifie un attribut existant (Admin)
   */
  async update(id: string, dto: UpdateAttributeDto) {
    await this.findOne(id);

    if (dto.type || dto.value) {
      const existing = await this.prisma.attribute.findUnique({
        where: { id }
      });

      const nextType = dto.type || existing!.type;
      const nextValue = dto.value || existing!.value;

      const duplicate = await this.prisma.attribute.findFirst({
        where: {
          id: { not: id },
          type: nextType,
          value: nextValue
        }
      });

      if (duplicate) {
        throw new ConflictException('Un attribut avec ce type et cette valeur existe déjà');
      }
    }

    return this.prisma.attribute.update({
      where: { id },
      data: dto
    });
  }

  /**
   * Supprime un attribut (Admin)
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.attribute.delete({
      where: { id }
    });

    return { message: 'Attribut supprimé avec succès' };
  }
}
