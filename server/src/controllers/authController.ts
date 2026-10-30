import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Buffer } from 'node:buffer';
import { env } from '../config/env.js';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../types/index.js';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['reader', 'participant']).default('reader'),
  }),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    success: true,
    data: {
      token,
      user: safeUser,
    },
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ success: false, error: 'Este e-mail já está cadastrado.' });
    return;
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);
  store.save();

  const token = jwt.sign(
    { userId: newUser.id, role: newUser.role, email: newUser.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    data: {
      token,
      user: safeUser,
    },
  });
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { credential, email: directEmail, name: directName, avatarUrl } = req.body;

  let email = directEmail;
  let name = directName;
  let picture = avatarUrl;

  // If a Google JWT credential was sent from @react-oauth/google, decode it
  if (credential) {
    try {
      const parts = credential.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        const googlePayload = JSON.parse(payloadJson);
        email = googlePayload.email || email;
        name = googlePayload.name || name;
        picture = googlePayload.picture || picture;
      }
    } catch (e) {
      console.warn('Could not parse Google JWT token payload, using fallback profile data:', e);
    }
  }

  if (!email) {
    res.status(400).json({ success: false, error: 'E-mail do Google não fornecido.' });
    return;
  }

  let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Auto-register user from Google
    user = {
      id: `user-google-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      avatarUrl: picture,
      passwordHash: bcrypt.hashSync(`google-oauth-${Date.now()}-${Math.random()}`, 10),
      role: 'reader',
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    store.save();
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    success: true,
    data: {
      token,
      user: safeUser,
    },
  });
};


export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { passwordHash: _, ...safeUser } = req.user;
  const userEntitlements = store.volumeEntitlements.filter(
    (e) => e.userId === req.user!.id && e.status === 'active'
  );

  res.json({
    success: true,
    data: {
      user: safeUser,
      entitlements: userEntitlements,
    },
  });
};

