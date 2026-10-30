import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { store } from '../db/store.js';
import { User, UserRole } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required. Missing token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: UserRole };
    const user = store.users.find((u) => u.id === payload.userId);

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid authentication session.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Token expired or invalid.' });
  }
};

export const optionalAuthenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: UserRole };
      const user = store.users.find((u) => u.id === payload.userId);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges.' });
      return;
    }

    next();
  };
};

