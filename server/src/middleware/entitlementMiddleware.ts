import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { store } from '../db/store.js';

export const requireVolumeEntitlement = (volumeParamName = 'volumeId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required to access volume contents.',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Admins bypass volume lock
    if (req.user.role === 'admin') {
      next();
      return;
    }

    let volumeId = req.params[volumeParamName] || (req.query[volumeParamName] as string) || req.body[volumeParamName];

    // If param is participant slug or id, resolve volume
    if (!volumeId && req.params.slug) {
      const participant = store.participants.find(
        (p) => p.slug === req.params.slug || p.id === req.params.slug
      );
      if (participant) {
        volumeId = participant.primaryVolumeId;
      }
    }

    if (!volumeId) {
      res.status(400).json({ success: false, error: 'Volume ID could not be identified.' });
      return;
    }

    // Check entitlement in store
    const entitlement = store.volumeEntitlements.find(
      (e) => e.userId === req.user!.id && e.volumeId === volumeId && e.status === 'active'
    );

    if (!entitlement) {
      res.status(403).json({
        success: false,
        error: `Acesso exclusivo restrito aos leitores confirmados do Volume ${volumeId}.`,
        code: 'VOLUME_ENTITLEMENT_REQUIRED',
        volumeId,
      });
      return;
    }

    next();
  };
};

