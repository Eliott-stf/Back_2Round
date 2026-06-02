import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrdersService } from '../orders/orders.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
    // Cache en mémoire pour les commandes en attente 
    private readonly pendingOrders = new Map<string, any>();

    // Registre en mémoire pour éviter le double-crédit si Stripe duplique le webhook 
    private readonly processedPayments = new Set<string>();

    constructor(
        private readonly stripeService: StripeService,
        private readonly ordersService: OrdersService,
        private readonly walletService: WalletService,
        private readonly transactionsService: TransactionsService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Crée l'intention de paiement et met le panier en "salle d'attente" 
     */
    async createTopupAndOrderIntent(buyerId: string, missingAmount: number, orderDto: any) {
        if (missingAmount <= 0) {
            throw new BadRequestException('Le montant manquant doit être positif');
        }

        const pendingOrderId = randomUUID();

        // Stockage du DTO en mémoire RAM
        this.pendingOrders.set(pendingOrderId, { buyerId, orderDto });

        // Nettoyage automatique après 1 heure pour éviter les fuites de mémoire
        setTimeout(() => {
            this.pendingOrders.delete(pendingOrderId);
        }, 3600 * 1000);

        // Création de l'intention Stripe
        const intent = await this.stripeService.createPaymentIntent({
            amount: missingAmount,
            description: `Complément commande - Utilisateur ${buyerId}`,
            metadata: {
                type: 'CHECKOUT_TOPUP',
                pendingOrderId,
            },
        });

        return { clientSecret: intent.client_secret };
    }

    /**
     * Point d'entrée du Webhook Stripe
     */
    async handleStripeWebhook(signature: string, rawBody: Buffer) {
        const event = this.stripeService.constructWebhookEvent(rawBody, signature);

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as any;
            await this.processSuccessfulPayment(paymentIntent);
        }

        return { received: true };
    }

    /**
     * Logique métier post-paiement
     */
    private async processSuccessfulPayment(paymentIntent: any) {

        // Vérification d'idempotence 
        if (this.processedPayments.has(paymentIntent.id)) {
            // Paiement déjà traité, on ignore
            return;
        }

        const metadata = paymentIntent.metadata;

        //Vérification
        if (metadata.type !== 'CHECKOUT_TOPUP' || !metadata.pendingOrderId) {
            return;
        }

        // Récupération du DTO en mémoire
        const pendingData = this.pendingOrders.get(metadata.pendingOrderId);
        if (!pendingData) {
            // Si la commande n'est plus en RAM (délai > 1h ou redémarrage serveur), 
            // l'argent est chez Stripe mais la commande est perdue. 
            throw new NotFoundException('Panier introuvable en mémoire');
        }

        const { buyerId, orderDto } = pendingData;
        //conversion en euro
        const amountInEuros = paymentIntent.amount / 100; 

        // Traitement métier transactionnel
        // On crédite le wallet de l'acheteur
        const wallet = await this.walletService.credit(this.prisma, buyerId, amountInEuros);

        // On trace l'entrée d'argent 
        await this.transactionsService.create(this.prisma, {
            amount: amountInEuros,
            type: 'CREDIT',
            description: `Rechargement par carte bancaire`,
            walletId: wallet.id,
        });

        // Création automatique de la commande via votre service existant
        await this.ordersService.create(buyerId, orderDto);

        // Nettoyage et verrouillage
        this.pendingOrders.delete(metadata.pendingOrderId);
        this.processedPayments.add(paymentIntent.id);

        // Nettoyage du registre d'idempotence après 24h
        setTimeout(() => {
            this.processedPayments.delete(paymentIntent.id);
        }, 24 * 3600 * 1000);
    }
}