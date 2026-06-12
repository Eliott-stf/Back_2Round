import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesGateway } from '../websocket/messages.gateway';

@Injectable()
export class MessagesService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  /**
   * Méthode utils privée validant l'appartenance d'un utilisateur à une conv
   * @param {string} userId Id de l'user
   * @param {string} conversationId Id de la conv
   * @returns {Promise<object>} L'entité conversation 
   * @throws {NotFoundException} Si la conversation est inexistante
   * @throws {ForbiddenException} Si l'utilisateur n'est ni l'acheteur ni le vendeur
   */
  private async checkAccess(userId: string, conversationId: string) {

    //On cherche la conversation en bdd
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { product: true },
    });

    //On vérifie qu'elle existe bien 
    if (!conversation) throw new NotFoundException('Conversation introuvable');

    const isBuyer = conversation.buyerId === userId;
    const isSeller = conversation.product.sellerId === userId;

    //On vérifie que les id des 2 user soit les memes que celles de la conversation 
    if (!isBuyer && !isSeller) throw new ForbiddenException('Accès refusé');

    return conversation;
  }

  /**
   * Méthode pour créer un message 
   * @param {string} userId id de l'user (exp)
   * @param {string} conversationId id de la conversation
   * @param {CreateMessageDto} dto  Objet contenant le contenu du message
   * @returns {Promise<object>} L'entité message 
   */
  async send(userId: string, conversationId: string, dto: CreateMessageDto) {

    //Vérif que l'user appartient a la conversation
    const conversation = await this.checkAccess(userId, conversationId);

    //On met a jour la conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    //On créer notre message en bdd
    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        senderId: userId,
        conversationId,
      },
      include: {
        sender: {
          select: { name: true, lastname: true, avatarUrl: true },
        },
      },
    });

    // Déterminer le destinataire du message
    const recipientId = conversation.buyerId === userId ? conversation.product.sellerId : conversation.buyerId;

    // Émettre aux deux parties en temps réel pour synchroniser les sessions
    this.messagesGateway.sendToUser(recipientId, 'message', { conversationId, message });
    this.messagesGateway.sendToUser(userId, 'message', { conversationId, message });

    return message;
  }

  /**
   * Méthode pour marquer le message en 'lu'
   * @param {string} userId - Id de l'user effectuant la lecture
   * @param {string} conversationId - Id de la conv
   */
  async markAsRead(userId: string, conversationId: string) {

    //Vérif que l'user appartient a la conversation
    await this.checkAccess(userId, conversationId);

    //On passe isRead a True
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }

}