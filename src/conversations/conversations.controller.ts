import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';


@Controller('conversations')
export class ConversationsController {

  constructor(private readonly conversationsService: ConversationsService) { }

  /**
   * POST /conversations
   * Initie une nouvelle conversation pour un produit.
   * @Auth Utilisateur authentifié.
   */
  @Post()
  @Auth()
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationsService.create(user.id, dto);
  }

  /**
   * GET /conversations
   * Liste les conversations actives de l'utilisateur.
   * @Auth Utilisateur authentifié.
   */
  @Get()
  @Auth()
  findAll(@CurrentUser() user: any) {
    return this.conversationsService.findAll(user.id);
  }

  /**
   * GET /conversations/:id
   * Affiche l'historique détaillé d'une conversation.
   * @Auth Utilisateur authentifié.
   */
  @Get(':id')
  @Auth()
  findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.conversationsService.findOne(user.id, id);
  }
}