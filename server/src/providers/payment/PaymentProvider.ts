import { env } from '../../config/env.js';

export interface PaymentIntent {
  id: string;
  userId: string;
  paidContentId: string;
  amountMinorUnits: number;
  currency: string;
  authorNetMinorUnits: number;
  platformFeeMinorUnits: number;
  checkoutUrl?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PaymentProvider {
  name: string;
  isAvailable(): boolean;
  createCheckout(data: {
    userId: string;
    paidContentId: string;
    amountMinorUnits: number;
    currency: string;
    description: string;
  }): Promise<PaymentIntent>;
  calculateCommission(amountMinorUnits: number): {
    platformFeeMinorUnits: number;
    authorNetMinorUnits: number;
  };
}

export class MockPaymentProvider implements PaymentProvider {
  name = 'mock';

  isAvailable(): boolean {
    return env.NODE_ENV !== 'production';
  }

  calculateCommission(amountMinorUnits: number) {
    const platformRate = env.PLATFORM_COMMISSION_PERCENT / 100;
    const platformFee = Math.round(amountMinorUnits * platformRate);
    const authorNet = amountMinorUnits - platformFee;
    return {
      platformFeeMinorUnits: platformFee,
      authorNetMinorUnits: authorNet,
    };
  }

  async createCheckout(data: {
    userId: string;
    paidContentId: string;
    amountMinorUnits: number;
    currency: string;
    description: string;
  }): Promise<PaymentIntent> {
    const { platformFeeMinorUnits, authorNetMinorUnits } = this.calculateCommission(data.amountMinorUnits);
    return {
      id: `SIM-PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: data.userId,
      paidContentId: data.paidContentId,
      amountMinorUnits: data.amountMinorUnits,
      currency: data.currency,
      platformFeeMinorUnits,
      authorNetMinorUnits,
      checkoutUrl: `/checkout/simulated?id=${Date.now()}`,
      status: 'completed',
    };
  }
}

export class MercadoPagoPaymentProvider implements PaymentProvider {
  name = 'mercadopago';

  isAvailable(): boolean {
    return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
  }

  calculateCommission(amountMinorUnits: number) {
    const platformRate = env.PLATFORM_COMMISSION_PERCENT / 100;
    const platformFee = Math.round(amountMinorUnits * platformRate);
    const authorNet = amountMinorUnits - platformFee;
    return { platformFeeMinorUnits: platformFee, authorNetMinorUnits: authorNet };
  }

  async createCheckout(_data: any): Promise<PaymentIntent> {
    throw new Error('Mercado Pago credentials not configured in production.');
  }
}

