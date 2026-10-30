import { Response } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { DiaryPost } from '../types/index.js';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    excerpt: z.string().optional(),
    visibility: z.enum(['public_preview', 'volume_readers', 'paid_content', 'private_draft']).default('volume_readers'),
    location: z.string().optional(),
    tags: z.array(z.string()).default([]),
    mediaUrls: z.array(z.string()).default([]),
  }),
});

export const getDiaryPostById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const post = store.diaryPosts.find((p) => p.id === id);

  if (!post) {
    res.status(404).json({ success: false, error: 'Publicação não encontrada.' });
    return;
  }

  // Check visibility rules
  if (post.visibility !== 'public_preview') {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'É necessário estar autenticado para ler esta entrada do diário.',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const hasEntitlement = store.volumeEntitlements.some(
      (e) => e.userId === req.user!.id && e.volumeId === post.volumeId && e.status === 'active'
    ) || req.user.role === 'admin';

    if (!hasEntitlement) {
      res.status(403).json({
        success: false,
        error: `Esta publicação é exclusiva para leitores verificados do Volume ${post.volumeId}.`,
        code: 'VOLUME_ENTITLEMENT_REQUIRED',
        volumeId: post.volumeId,
      });
      return;
    }
  }

  const participant = store.participants.find((p) => p.id === post.participantId);

  res.json({
    success: true,
    data: {
      post,
      participant,
    },
  });
};

export const createDiaryPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  // Find participant profile matching current user or participant role
  const participant = store.participants.find(
    (p) => p.userId === req.user!.id || req.user!.role === 'admin'
  );

  if (!participant && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Apenas autores e participantes podem publicar no Living Diary.',
    });
    return;
  }

  const effectiveParticipantId = participant ? participant.id : 'juliana';
  const effectiveVolumeId = participant ? participant.primaryVolumeId : '01';

  const { title, content, excerpt, visibility, location, tags, mediaUrls } = req.body;

  const newPost: DiaryPost = {
    id: `post-${Date.now()}`,
    participantId: effectiveParticipantId,
    volumeId: effectiveVolumeId,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    excerpt: excerpt || content.slice(0, 160) + '...',
    content,
    visibility,
    location,
    tags,
    likesCount: 0,
    mediaUrls,
    isPinned: false,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  store.diaryPosts.unshift(newPost);
  store.save();

  res.status(201).json({
    success: true,
    data: newPost,
  });
};

export const likePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const post = store.diaryPosts.find((p) => p.id === id);

  if (!post) {
    res.status(404).json({ success: false, error: 'Publicação não encontrada.' });
    return;
  }

  post.likesCount += 1;
  store.save();

  res.json({
    success: true,
    data: { likesCount: post.likesCount },
  });
};

