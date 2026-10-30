import { env } from '../../config/env.js';

export interface VerificationResult {
  success: boolean;
  status: 'active' | 'pending' | 'rejected';
  reference: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface PurchaseVerificationProvider {
  name: string;
  isAvailable(): boolean;
  verifyPurchase(data: {
    userId: string;
    volumeId: string;
    orderReference: string;
    receiptData?: any;
  }): Promise<VerificationResult>;
  getVerificationStatus(reference: string): Promise<'active' | 'pending' | 'rejected' | 'revoked'>;
  revokeVerification(reference: string): Promise<boolean>;
}

/**
 * MockVerificationProvider
 * Exclusivo para ambiente de desenvolvimento e testes.
 * BLOQUEADO TERMINANTEMENTE EM PRODUÇÃO.
 */
export class MockVerificationProvider implements PurchaseVerificationProvider {
  name = 'mock';

  isAvailable(): boolean {
    return env.NODE_ENV !== 'production';
  }

  async verifyPurchase(data: {
    userId: string;
    volumeId: string;
    orderReference: string;
  }): Promise<VerificationResult> {
    if (env.NODE_ENV === 'production') {
      throw new Error('SECURITY VIOLATION: MockVerificationProvider cannot be activated in production.');
    }

    const trimmed = data.orderReference.trim().toUpperCase();
    const expectedKey = `PB-DEMO-${data.volumeId}`;

    if (trimmed === expectedKey || trimmed.startsWith('PB-DEV-') || trimmed.startsWith('DEMO-')) {
      return {
        success: true,
        status: 'active',
        reference: `MOCK-${Date.now()}-${data.volumeId}`,
        message: `Volume ${data.volumeId} ativado com sucesso em ambiente de desenvolvimento.`,
        metadata: {
          simulatedAt: new Date().toISOString(),
          provider: 'MockVerificationProvider',
        },
      };
    }

    return {
      success: false,
      status: 'rejected',
      reference: `MOCK-FAIL-${Date.now()}`,
      message: `Código demonstrativo inválido. Para testar, use o código: PB-DEMO-${data.volumeId}`,
    };
  }

  async getVerificationStatus(reference: string): Promise<'active' | 'pending' | 'rejected' | 'revoked'> {
    return reference.includes('FAIL') ? 'rejected' : 'active';
  }

  async revokeVerification(_reference: string): Promise<boolean> {
    return true;
  }
}

/**
 * ManualVerificationProvider
 * Fluxo oficial para revisão humana e auditoria de comprovantes.
 */
export class ManualVerificationProvider implements PurchaseVerificationProvider {
  name = 'manual';

  isAvailable(): boolean {
    return true;
  }

  async verifyPurchase(data: {
    userId: string;
    volumeId: string;
    orderReference: string;
    receiptData?: any;
  }): Promise<VerificationResult> {
    const ref = `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      status: 'pending',
      reference: ref,
      message: 'Solicitação de verificação manual registrada com sucesso. A equipe editorial analisará o comprovante.',
      metadata: {
        submittedAt: new Date().toISOString(),
        orderReference: data.orderReference,
      },
    };
  }

  async getVerificationStatus(_reference: string): Promise<'active' | 'pending' | 'rejected' | 'revoked'> {
    return 'pending';
  }

  async revokeVerification(_reference: string): Promise<boolean> {
    return true;
  }
}

/**
 * AmazonKdpVerificationProvider
 * Adaptador preparado para integração futura com a Amazon KDP.
 * Mantido desabilitado por padrão conforme Seção 9 das regras inegociáveis.
 */
export class AmazonKdpVerificationProvider implements PurchaseVerificationProvider {
  name = 'amazon_kdp';

  isAvailable(): boolean {
    // KDP não oferece endpoint de validação de pedido unitário por comprador
    return false;
  }

  async verifyPurchase(_data: {
    userId: string;
    volumeId: string;
    orderReference: string;
  }): Promise<VerificationResult> {
    return {
      success: false,
      status: 'rejected',
      reference: `KDP-DISABLED-${Date.now()}`,
      message: 'A integração automatizada direta da Amazon KDP está desabilitada no momento. Por favor, envie sua solicitação para a Verificação Manual com o comprovante do pedido da Amazon.',
    };
  }

  async getVerificationStatus(_reference: string): Promise<'active' | 'pending' | 'rejected' | 'revoked'> {
    return 'rejected';
  }

  async revokeVerification(_reference: string): Promise<boolean> {
    return false;
  }
}

