import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { Role } from '../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Auth } from '../common/decorators/auth.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  /**
   * GET /products?search...
   * Liste de tout les produits (peuvent etre filtré par choix )
   * accessible a tous 
   */
  @Get()
  findAll(@Query() filters: FilterProductDto) {
    return this.productsService.findAll(filters);
  }

  /**
   * GET /products/:id
   * Detail d'un produit 
   * accessible a tous 
   * @param id id du produit
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * POST /products
   * Créer un product
   * @Auth ROLE.USER Seul un utilisateur connecté peut créer un produit 
   */
  @Post()
  @Auth()
  create(@CurrentUser() user: any, @Body() dto: CreateProductDto,) {
    return this.productsService.create(user.id, dto);
  }

  /**
   * PATCH /products/:id
   * Modifier un produit 
   * @Auth Role.USER Seul un utilisateur connecté peut modifier un produit
   * @param id id du produit 
   */
  @Patch(':id')
  @Auth()
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user.id, id, dto);
  }

  /**
   * DELETE :products/:id
   * Supprimer un produit 
   * @Auth Role.USER Seul un utilisateur connecté peut supprimer un produit
   * @param id id du produit 
   */
  @Delete(':id')
  @Auth()
  remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(user.id, id);
  }

  /**
   * POST /products/:id/favorite
   * Ajouter/Supprimer un favori
   * @Auth Role.USER Seul un utilisateur connecté peut ajouter,supprimer un favori
   */
  @Post(':id/favorite')
  @Auth()
  toggleFavorite(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.productsService.toggleFavorite(user.id, id);
  }
}
