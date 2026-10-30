import { Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { VolumeEntitlement } from '../types/index.js';

export const getAdminOverview = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const totalUsers = store.users.length;
  const totalParticipants = store.participants.length;
  const totalVolumes = store.volumes.length;
  const activeEntitlements = store.volumeEntitlements.filter((e) => e.status === 'active').length;
  const pendingVerifications = store.purchaseVerificationRequests.filter((r) => r.status === 'pending').length;
  const totalPosts = store.diaryPosts.length;
  const totalPurchases = store.contentPurchases.length;

  const totalGrossRevenueMinorUnits = store.contentPurchases.reduce(
    (sum, p) => sum + p.amountPaidMinorUnits,
    0
  );
  const totalPlatformCommissionsMinorUnits = store.contentPurchases.reduce(
    (sum, p) => sum + p.platformFeeMinorUnits,
    0
  );

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalParticipants,
        totalVolumes,
        activeEntitlements,
        pendingVerifications,
        totalPosts,
        totalPurchases,
        totalGrossRevenueFormatted: `R$ ${(totalGrossRevenueMinorUnits / 100).toFixed(2)}`,
        totalPlatformCommissionsFormatted: `R$ ${(totalPlatformCommissionsMinorUnits / 100).toFixed(2)}`,
      },
      pendingVerificationsList: store.purchaseVerificationRequests.filter((r) => r.status === 'pending'),
      recentUsers: store.users.slice(-10).reverse().map(({ passwordHash: _, ...u }) => u),
      applications: store.participantApplications,
    },
  });
};

export const reviewVerificationRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { action, notes } = req.body; // 'approve' | 'reject'

  const request = store.purchaseVerificationRequests.find((r) => r.id === id);
  if (!request) {
    res.status(404).json({ success: false, error: 'Solicitação não encontrada.' });
    return;
  }

  request.status = action === 'approve' ? 'verified' : 'rejected';
  request.notes = notes || request.notes;
  request.reviewedBy = req.user?.id;
  request.reviewedAt = new Date().toISOString();

  if (action === 'approve') {
    // Create or activate entitlement
    const existing = store.volumeEntitlements.find(
      (e) => e.userId === request.userId && e.volumeId === request.volumeId
    );

    if (existing) {
      existing.status = 'active';
      existing.verifiedAt = new Date().toISOString();
    } else {
      const newEnt: VolumeEntitlement = {
        id: `ent-admin-${Date.now()}`,
        userId: request.userId,
        volumeId: request.volumeId,
        status: 'active',
        verificationMethod: 'manual',
        verificationReference: `REQ-${request.id}`,
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      store.volumeEntitlements.push(newEnt);
    }
  }

  store.save();

  res.json({
    success: true,
    message: `Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso.`,
    data: request,
  });
};

export const submitApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    publicName,
    legalName,
    email,
    country,
    city,
    languages,
    profession,
    isAdult,
    storySummary,
    interests,
    motivation,
    conversationAvailability,
  } = req.body;

  const newApp = {
    id: `app-${Date.now()}`,
    userId: req.user?.id,
    publicName,
    legalName: legalName || publicName,
    email,
    country,
    city,
    languages: Array.isArray(languages) ? languages : [languages || 'pt-BR'],
    profession,
    isAdult: Boolean(isAdult),
    storySummary,
    interests,
    motivation,
    conversationAvailability,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  store.participantApplications.push(newApp);
  store.save();

  res.status(201).json({
    success: true,
    message: 'Candidatura enviada com sucesso! A curadoria editorial entrará em contato.',
    data: newApp,
  });
};

