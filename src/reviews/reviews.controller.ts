import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {

  constructor(private readonly reviewsService: ReviewsService) { }

  /**
   * POST /reviews/:orderId
   * Enregistre un avis sur un commande
   * @Auth Utilisateur authentifié 
   */
  @Post(':orderId')
  @Auth()
  create(
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, orderId, dto);
  }

  /**
   * GET /reviews/order/:orderId
   * Récupère l'avis associé à une commande
   * @Auth Utilisateur authentifié 
   */
  @Get('order/:orderId')
  @Auth()
  findByOrder(@Param('orderId') orderId: string) {
    return this.reviewsService.findByOrder(orderId);
  }

  /**
   * DELETE /reviews/:id
   * Supprime un avis 
   * @Auth Utilisateur authentifié 
   */
  @Delete(':id')
  @Auth()
  remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.reviewsService.remove(user.id, id);
  }

  /**
   * GET /reviews/user/:userId
   * Récupère la liste des avis associés au profil d'un vendeur
   * Accessible à tous
   */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

}