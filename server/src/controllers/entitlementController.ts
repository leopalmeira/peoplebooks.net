import { Response } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  MockVerificationProvider,
  ManualVerificationProvider,
  AmazonKdpVerificationProvider,
} from '../providers/verification/PurchaseVerificationProvider.js';
import { PurchaseVerificationRequest, VolumeEntitlement } from '../types/index.js';

const mockProvider = new MockVerificationProvider();
const manualProvider = new ManualVerificationProvider();
const kdpProvider = new AmazonKdpVerificationProvider();

export const verifyVolumeSchema = z.object({
  body: z.object({
    volumeId: z.string(),
    verificationMethod: z.enum(['mock', 'manual', 'amazon_kdp']),
    orderReference: z.string().min(1),
    receiptData: z.any().optional(),
  }),
});

export const requestVolumeVerification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { volumeId, verificationMethod, orderReference, receiptData } = req.body;
  const volume = store.volumes.find((v) => v.id === volumeId);

  if (!volume) {
    res.status(404).json({ success: false, error: 'Volume informado não existe.' });
    return;
  }

  // Check if already active
  const existingEntitlement = store.volumeEntitlements.find(
    (e) => e.userId === req.user!.id && e.volumeId === volumeId && e.status === 'active'
  );

  if (existingEntitlement) {
    res.json({
      success: true,
      message: `Você já possui acesso ativo ao Volume ${volumeId}.`,
      data: existingEntitlement,
    });
    return;
  }

  // Select provider
  let provider;
  if (verificationMethod === 'mock') {
    provider = mockProvider;
  } else if (verificationMethod === 'amazon_kdp') {
    provider = kdpProvider;
  } else {
    provider = manualProvider;
  }

  try {
    const result = await provider.verifyPurchase({
      userId: req.user.id,
      volumeId,
      orderReference,
      receiptData,
    });

    if (result.status === 'active') {
      // Create active entitlement
      const newEntitlement: VolumeEntitlement = {
        id: `ent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: req.user.id,
        volumeId,
        status: 'active',
        verificationMethod,
        verificationReference: result.reference,
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      store.volumeEntitlements.push(newEntitlement);
      store.save();

      res.json({
        success: true,
        message: result.message,
        data: newEntitlement,
      });
      return;
    }

    // Otherwise create pending verification request
    const newRequest: PurchaseVerificationRequest = {
      id: `req-${Date.now()}`,
      userId: req.user.id,
      volumeId,
      provider: verificationMethod,
      orderNumber: orderReference,
      receiptData,
      status: result.status,
      notes: result.message,
      createdAt: new Date().toISOString(),
    };

    store.purchaseVerificationRequests.push(newRequest);
    store.save();

    res.json({
      success: result.success,
      message: result.message,
      data: newRequest,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

export const getMyEntitlements = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const entitlements = store.volumeEntitlements.filter(
    (e) => e.userId === req.user!.id && e.status === 'active'
  );

  const pendingRequests = store.purchaseVerificationRequests.filter(
    (r) => r.userId === req.user!.id && r.status === 'pending'
  );

  res.json({
    success: true,
    data: {
      activeVolumes: entitlements.map((e) => e.volumeId),
      entitlements,
      pendingRequests,
    },
  });
};

