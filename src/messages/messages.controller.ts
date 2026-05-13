import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';


@Controller('conversations/:conversationId/messages')
export class MessagesController {

  constructor(private readonly messagesService: MessagesService) {}

  /**
   * POST /conversations/:conversationId/messages
   * Transmet un nouveau message au sein d'une conversation spécifique
   * @Auth Utilisateur authentifié.
   */
  @Post()
  @Auth()
  send(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.send(user.id, conversationId, dto);
  }

  /**
   * POST /conversations/:conversationId/messages/read
   * Actualise le statut des messages reçus de la conversation en "lus"
   * @Auth Utilisateur authentifié.
   */
  @Post('read')
  @Auth()
  markAsRead(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.markAsRead(user.id, conversationId);
  }

}