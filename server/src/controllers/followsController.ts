import { Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Follow } from '../types/index.js';

export const toggleFollow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { participantId } = req.params;
  const participant = store.participants.find((p) => p.id === participantId);

  if (!participant) {
    res.status(404).json({ success: false, error: 'Participante não encontrado.' });
    return;
  }

  // INEGOTIABLE RULE 7: Following requires active volume entitlement
  const hasEntitlement = store.volumeEntitlements.some(
    (e) => e.userId === req.user!.id && e.volumeId === participant.primaryVolumeId && e.status === 'active'
  ) || req.user.role === 'admin';

  if (!hasEntitlement) {
    res.status(403).json({
      success: false,
      error: `Para seguir ${participant.name}, ative primeiro o Volume ${participant.primaryVolumeId} na sua biblioteca.`,
      code: 'VOLUME_ENTITLEMENT_REQUIRED',
      volumeId: participant.primaryVolumeId,
    });
    return;
  }

  const existingIndex = store.follows.findIndex(
    (f) => f.followerUserId === req.user!.id && f.participantId === participantId
  );

  let isFollowing = false;
  if (existingIndex !== -1) {
    store.follows.splice(existingIndex, 1);
    isFollowing = false;
  } else {
    const newFollow: Follow = {
      id: `f-${Date.now()}`,
      followerUserId: req.user.id,
      participantId,
      createdAt: new Date().toISOString(),
    };
    store.follows.push(newFollow);
    isFollowing = true;
  }

  store.save();

  res.json({
    success: true,
    data: {
      isFollowing,
      participantId,
    },
  });
};

export const getMyFeed = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  // Get list of followed participant IDs
  const followedIds = store.follows
    .filter((f) => f.followerUserId === req.user!.id)
    .map((f) => f.participantId);

  // Get feed posts from followed people + public announcements
  const feedPosts = store.diaryPosts
    .filter((p) => followedIds.includes(p.participantId) || p.isPinned)
    .map((post) => {
      const author = store.participants.find((pt) => pt.id === post.participantId);
      return {
        ...post,
        author,
      };
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  res.json({
    success: true,
    data: {
      feed: feedPosts,
      followedCount: followedIds.length,
    },
  });
};

export const getMyFollowing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const followedIds = store.follows
    .filter((f) => f.followerUserId === req.user!.id)
    .map((f) => f.participantId);

  const followingPeople = store.participants.filter((p) => followedIds.includes(p.id));

  res.json({
    success: true,
    data: followingPeople,
  });
};

