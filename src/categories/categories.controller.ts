import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { Role } from '../generated/prisma/enums';

@Controller('categories')
export class CategoriesController {

  constructor(private readonly categoriesService: CategoriesService) { }

  /**
   * GET /categories
   * Liste de toutes les catégories
   * accessible a tous 
   */
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * GET /categories/:id
   * Detail d'une catégorie 
   * accessible a tous 
   * @param id id de la catégorie
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * POST /categories
   * Créer une catégorie
   * @Auth ROLE.ADMIN Seul un administrateur peut créer une catégorie 
   */
  @Post()
  @Auth(Role.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  /**
   * PATCH /categories/:id
   * Modifier une catégorie 
   * @Auth ROLE.ADMIN Seul un administrateur peut modifier une catégorie
   * @param id id de la catégorie 
   */
  @Patch(':id')
  @Auth(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  /**
   * DELETE /categories/:id
   * Supprimer une catégorie 
   * @Auth ROLE.ADMIN Seul un administrateur peut supprimer une catégorie
   * @param id id de la catégorie 
   */
  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

}