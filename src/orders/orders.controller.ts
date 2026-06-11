import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Role } from '../generated/prisma/enums';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {

  constructor(private readonly ordersService: OrdersService) { }

  /**
    * POST /orders
    * Initialise le processus d'achat (création de commande et transactions).
    * Requis : Utilisateur authentifié.
    */
  @Post()
  @Auth()
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.id, dto);
  }

  /**
   * GET /orders
   * Récupère l'historique des achats de l'utilisateur connecté.
   * @Auth USER : Utilisateur authentifié.
   */
  @Get()
  @Auth()
  findMyOrders(@CurrentUser() user: any) {
    return this.ordersService.findMyOrders(user.id);
  }

  /**
   * GET /orders/selling
   * Récupère la liste des ventes générées par l'utilisateur connecté.
   * @Auth USER : Utilisateur authentifié.
   */
  @Get('selling')
  @Auth()
  findMySales(@CurrentUser() user: any) {
    return this.ordersService.findMySales(user.id);
  }

  /**
   * GET /orders/all
   * Vue globale de l'intégralité des commandes de la plateforme.
   * @Auth Rôle ADMINISTRATEUR.
   */
  @Get('all')
  @Auth(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * GET /orders/:id
   * Affiche les détails d'une commande précise.
   * @Auth USER : Utilisateur authentifié.
   */
  @Get(':id')
  @Auth()
  findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(user.id, id);
  }

  /**
   * PATCH /orders/:id/cancel
   * Interrompt et annule une commande avant traitement.
   * @Auth USER : Utilisateur authentifié.
   */
  @Patch(':id/cancel')
  @Auth()
  cancel(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.ordersService.cancel(user.id, id);
  }

  /**
   * PATCH /orders/admin/:id/cancel-refund
   * Annule une commande payée, rembourse l'acheteur, génère une facture d'annulation
   * @Auth Rôle ADMINISTRATEUR
   */
  @Patch('admin/:id/cancel-refund')
  @Auth(Role.ADMIN)
  cancelAndRefundAdmin(@Param('id') id: string) {
    return this.ordersService.cancelAndRefundAdmin(id);
  }

}