import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: any;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new Stripe(secretKey, {

      apiVersion: '2026-05-27.dahlia' as any, 
    });
  }

  get client() {
    return this.stripe;
  }

  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    metadata?: Record<string, string>;
    description?: string;
  }) {
    const { amount, currency = 'eur', metadata = {}, description } = params;

    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      description,
      automatic_payment_methods: { enabled: true },
    });
  }

  constructWebhookEvent(
    rawBody: Buffer | string,
    signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new InternalServerErrorException('STRIPE_WEBHOOK_SECRET is not defined');
    }

    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }
}