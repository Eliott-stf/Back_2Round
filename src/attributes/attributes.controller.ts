import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { Role } from '../generated/prisma/enums';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  /**
   * GET /attributes
   * Liste de tous les attributs de taille (accessible à tous)
   */
  @Get()
  findAll() {
    return this.attributesService.findAll();
  }

  /**
   * GET /attributes/:id
   * Détail d'un attribut (accessible à tous)
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(id);
  }

  /**
   * POST /attributes
   * Créer un attribut (ADMIN uniquement)
   */
  @Post()
  @Auth(Role.ADMIN)
  create(@Body() dto: CreateAttributeDto) {
    return this.attributesService.create(dto);
  }

  /**
   * PATCH /attributes/:id
   * Modifier un attribut (ADMIN uniquement)
   */
  @Patch(':id')
  @Auth(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAttributeDto) {
    return this.attributesService.update(id, dto);
  }

  /**
   * DELETE /attributes/:id
   * Supprimer un attribut (ADMIN uniquement)
   */
  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.attributesService.remove(id);
  }
}
