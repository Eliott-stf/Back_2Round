import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';


@Controller('offers')
export class OffersController {

  constructor(private readonly offersService: OffersService) { }

  /**
   * POST /offers
   * Soumet une nouvelle proposition de prix pour un produit
   * @Auth Utilisateur authentifié.
   */
  @Post()
  @Auth()
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateOfferDto,
  ) {
    return this.offersService.create(user.id, dto);
  }

  /**
   * GET /offers/received
   * Récupère la liste des offres reçues (Vendeur).
   * @Auth Utilisateur authentifié.
   */
  @Get('received')
  @Auth()
  findReceived(@CurrentUser() user: any) {
    return this.offersService.findReceived(user.id);
  }

  /**
   * GET /offers/sent
   * Récupère la liste des offres émises (Acheteur).
   * @Auth Utilisateur authentifié.
   */
  @Get('sent')
  @Auth()
  findSent(@CurrentUser() user: any) {
    return this.offersService.findSent(user.id);
  }

  /**
   * PATCH /offers/:id/accept
   * Approuve une offre 
   * @Auth Utilisateur authentifié.
   * @param {string} id id de l'offre
   */
  @Patch(':id/accept')
  @Auth()
  accept(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.offersService.accept(user.id, id);
  }

  /**
   * PATCH /offers/:id/reject
   * Décline une offre 
   * @Auth Utilisateur authentifié.
   * @param {string} id id de l'offre
   */
  @Patch(':id/reject')
  @Auth()
  reject(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.offersService.reject(user.id, id);
  }
}