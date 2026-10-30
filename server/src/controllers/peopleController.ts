import { Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const listPeople = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    volume,
    country,
    tag,
    search,
    page = '1',
    limit = '12',
  } = req.query as Record<string, string>;

  let result = [...store.participants];

  // Filters
  if (volume && volume !== 'all') {
    result = result.filter((p) => p.primaryVolumeId === volume);
  }

  if (country && country !== 'all') {
    result = result.filter((p) => p.country.toLowerCase() === country.toLowerCase());
  }

  if (tag && tag !== 'all') {
    result = result.filter((p) => p.tag.toLowerCase().includes(tag.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q)
    );
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const total = result.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIdx = (pageNum - 1) * limitNum;
  const paginated = result.slice(startIdx, startIdx + limitNum);

  // Extract unique filters for UI
  const countries = Array.from(new Set(store.participants.map((p) => p.country))).sort();
  const tags = Array.from(new Set(store.participants.map((p) => p.tag))).sort();

  res.json({
    success: true,
    data: {
      people: paginated,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      availableFilters: {
        countries,
        tags,
      },
    },
  });
};

export const getPersonBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { slug } = req.params;
  const person = store.participants.find((p) => p.slug === slug || p.id === slug);

  if (!person) {
    res.status(404).json({ success: false, error: 'Perfil não encontrado.' });
    return;
  }

  const volume = store.volumes.find((v) => v.id === person.primaryVolumeId);

  // Check if current user is entitled to this person's volume
  let isEntitled = false;
  let isFollowing = false;
  let conversationStatus: string | null = null;

  if (req.user) {
    isEntitled = store.volumeEntitlements.some(
      (e) => e.userId === req.user!.id && e.volumeId === person.primaryVolumeId && e.status === 'active'
    ) || req.user.role === 'admin';

    isFollowing = store.follows.some(
      (f) => f.followerUserId === req.user!.id && f.participantId === person.id
    );

    const conv = store.conversationRequests.find(
      (c) => c.readerId === req.user!.id && c.participantId === person.id
    );
    if (conv) conversationStatus = conv.status;
  }

  // Get diary posts
  // If not entitled, only return public previews!
  const allPosts = store.diaryPosts.filter((d) => d.participantId === person.id);
  const visiblePosts = isEntitled
    ? allPosts
    : allPosts.filter((d) => d.visibility === 'public_preview');

  // Get paid contents
  const paidContents = store.paidContents.filter((pc) => pc.participantId === person.id);

  res.json({
    success: true,
    data: {
      person,
      volume,
      isEntitled,
      isFollowing,
      conversationStatus,
      diaryPosts: visiblePosts,
      totalDiaryPosts: allPosts.length,
      paidContents,
      qrUrl: `https://peoplebooks.net/people/${person.slug}`,
    },
  });
};

