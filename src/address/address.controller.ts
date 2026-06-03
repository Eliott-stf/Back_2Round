import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddressService } from './address.service';


@Controller('addresses')
export class AddressesController {

  constructor(private readonly addressesService: AddressService) {}

  /**
   * POST /addresses
   * Ajouter une adresse
   * @Auth Seul un utilisateur connecté peut ajouter une adresse
   */
  @Post()
  @Auth()
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.create(user.id, dto);
  }

  /**
   * GET /addresses
   * Lister mes adresses
   * @Auth Seul un utilisateur connecté peut voir ses adresses
   */
  @Get()
  @Auth()
  findAll(@CurrentUser() user: any) {
    return this.addressesService.findAll(user.id);
  }

  /**
   * GET /addresses/:id
   * Détail d'une adresse
   * @Auth Seul un utilisateur connecté peut voir ses adresses
   * @param id Id de l'adresse
   */
  @Get(':id')
  @Auth()
  findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.addressesService.findOne(user.id, id);
  }

  /**
   * PATCH /addresses/:id
   * Modifier une adresse
   * @Auth Seul un utilisateur connecté peut modifier ses adresses
   * @param id Id de l'adresse
   */
  @Patch(':id')
  @Auth()
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(user.id, id, dto);
  }

  /**
   * DELETE /addresses/:id
   * Supprimer une adresse
   * @Auth Seul un utilisateur connecté peut supprimer ses adresses
   * @param id Id de l'adresse
   */
  @Delete(':id')
  @Auth()
  remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.addressesService.remove(user.id, id);
  }

}