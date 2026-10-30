import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const listVolumes = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: store.volumes,
  });
};

export const getVolumeBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { slug } = req.params;
  const volume = store.volumes.find((v) => v.slug === slug || v.id === slug);

  if (!volume) {
    res.status(404).json({ success: false, error: 'Volume não encontrado.' });
    return;
  }

  const participants = store.participants.filter((p) => p.primaryVolumeId === volume.id);

  let isEntitled = false;
  if (req.user) {
    isEntitled = store.volumeEntitlements.some(
      (e) => e.userId === req.user!.id && e.volumeId === volume.id && e.status === 'active'
    ) || req.user.role === 'admin';
  }

  res.json({
    success: true,
    data: {
      volume,
      participants,
      isEntitled,
    },
  });
};

