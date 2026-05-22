import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService){}

  /**
   * Méthode pour lister toutes les catégories avec leurs enfants 
   */
  async findAll(){
    return this.prisma.category.findMany({
      where: { parentId: null },
       include: {
         // leurs sous-catégories
        children: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Méthode pour afficher le détail d'une catégorie
   * @param {string} id Id de la catégorie
   * @returns Un objet avec la catégorie
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
      },
    });

    //On throw une exception notfound si aucune catégorie trouvée 
    if (!category) throw new NotFoundException('Catégorie introuvable');
    return category;
  }

  /**
   * Méthode pour créer une catégorie (ADMIN)
   * @param {CreateCategoryDto} dto DTO d'une création d'une catégorie 
   * @returns 
   */
  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    //Si le slug existe déja on throw 
    if (exists) throw new ConflictException('Ce slug est déjà utilisé');

    //Sinon on créer la catégorie 
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId,
      },
      include: { children: true, parent: true },
    });
  }

  /**
   * Méthode pour modifier une catégorie (ADMIN) 
   * @param {string} id Id de la catégorie 
   * @param {UpdateCategoryDto} dto DTO de l'update 
   */
  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: dto,
      include: { children: true, parent: true },
    });
  }

  /**
   * Méthode pour supprimer un catégorie
   * A éviter. DeleteOnCascade 
   * @param {string} id id de la catégorie 
   * @returns message
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Catégorie supprimée avec succès' };
  }

}