import { Controller, Post, Body, Req, Headers, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Request } from 'express';
import { TopupAndOrderDto } from './dto/topup-and-order';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * Route appelée par le front-end lors de la validation du panier
     */
    @Post('topup-and-order')
    @Auth()
    async topupAndOrder(
        @CurrentUser() user: any,
        @Body() dto: TopupAndOrderDto,
    ) {
        return this.paymentsService.createTopupAndOrderIntent(
            user.id,
            dto.missingAmount,
            dto.orderDto
        );
    }
    /**
     * Webhook Stripe.
     * C'est Stripe qui appelle cette route, pas l'utilisateur.
     */
    @Post('webhook')
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: Request,
    ) {
        if (!signature) {
            throw new BadRequestException('Signature manquante');
        }

        // Le corps brut de la requête doit être disponible sur req.rawBody
        return this.paymentsService.handleStripeWebhook(signature, (req as any).rawBody);
    }
}