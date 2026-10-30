import { Response } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { MockPaymentProvider } from '../providers/payment/PaymentProvider.js';
import { ContentPurchase, FinancialLedgerEntry } from '../types/index.js';

const paymentProvider = new MockPaymentProvider();

export const purchaseContentSchema = z.object({
  body: z.object({
    contentId: z.string(),
  }),
});

export const purchaseContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { contentId } = req.body;
  const content = store.paidContents.find((c) => c.id === contentId);

  if (!content) {
    res.status(404).json({ success: false, error: 'Conteúdo pago não encontrado.' });
    return;
  }

  // Check Volume Entitlement first!
  const hasVolumeAccess = store.volumeEntitlements.some(
    (e) => e.userId === req.user!.id && e.volumeId === content.volumeId && e.status === 'active'
  ) || req.user.role === 'admin';

  if (!hasVolumeAccess) {
    res.status(403).json({
      success: false,
      error: `Para adquirir este conteúdo adicional, é necessário ter acesso ativo ao Volume ${content.volumeId}.`,
      code: 'VOLUME_ENTITLEMENT_REQUIRED',
    });
    return;
  }

  // Check if already purchased
  const alreadyPurchased = store.contentPurchases.some(
    (p) => p.userId === req.user!.id && p.paidContentId === content.id && p.status === 'completed'
  );

  if (alreadyPurchased) {
    res.json({
      success: true,
      message: 'Você já possui este conteúdo liberado.',
      data: { contentId: content.id, isUnlocked: true },
    });
    return;
  }

  // Create payment intent
  const paymentIntent = await paymentProvider.createCheckout({
    userId: req.user.id,
    paidContentId: content.id,
    amountMinorUnits: content.priceMinorUnits,
    currency: content.currency,
    description: content.title,
  });

  // Record Purchase
  const newPurchase: ContentPurchase = {
    id: `purch-${Date.now()}`,
    userId: req.user.id,
    paidContentId: content.id,
    amountPaidMinorUnits: content.priceMinorUnits,
    currency: content.currency,
    platformFeeMinorUnits: paymentIntent.platformFeeMinorUnits,
    authorNetMinorUnits: paymentIntent.authorNetMinorUnits,
    paymentMethod: 'simulated_card_or_pix',
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  store.contentPurchases.push(newPurchase);

  // Update participant's financial ledger (80% net earnings)
  const currentLedger = store.financialLedger.filter((l) => l.participantId === content.participantId);
  const lastBalance = currentLedger.length > 0 ? currentLedger[currentLedger.length - 1].balanceAfterMinorUnits : 0;
  const newBalance = lastBalance + paymentIntent.authorNetMinorUnits;

  const ledgerEntry: FinancialLedgerEntry = {
    id: `ledg-${Date.now()}`,
    participantId: content.participantId,
    transactionType: 'sale',
    amountMinorUnits: paymentIntent.authorNetMinorUnits,
    balanceAfterMinorUnits: newBalance,
    currency: content.currency,
    referenceId: newPurchase.id,
    description: `Venda do conteúdo: ${content.title} (Bruto: R$ ${(content.priceMinorUnits / 100).toFixed(2)}, Comissão PeopleBooks 20%: R$ ${(paymentIntent.platformFeeMinorUnits / 100).toFixed(2)})`,
    createdAt: new Date().toISOString(),
  };

  store.financialLedger.push(ledgerEntry);
  store.save();

  res.status(201).json({
    success: true,
    message: 'Conteúdo adquirido e liberado com sucesso!',
    data: {
      purchase: newPurchase,
      ledger: ledgerEntry,
      downloadVaultToken: `VAULT-TOKEN-${Date.now()}-${content.id}`,
    },
  });
};

export const getMyPurchases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const myPurchases = store.contentPurchases.filter((p) => p.userId === req.user!.id);
  const detailed = myPurchases.map((purchase) => {
    const item = store.paidContents.find((c) => c.id === purchase.paidContentId);
    const author = item ? store.participants.find((pt) => pt.id === item.participantId) : null;
    return {
      ...purchase,
      item,
      author,
    };
  });

  res.json({
    success: true,
    data: detailed,
  });
};

