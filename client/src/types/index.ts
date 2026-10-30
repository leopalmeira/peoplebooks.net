export type UserRole = 'visitor' | 'reader' | 'participant' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  createdAt: string;
}

export interface Volume {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  theme: string;
  storiesCount: number;
  amazonUrl: string;
  coverImageUrl: string;
  status: 'published' | 'draft' | 'archived';
  priceCents: number;
  currency: string;
  publishedAt: string;
}

export interface Participant {
  id: string;
  slug: string;
  userId?: string;
  primaryVolumeId: string;
  name: string;
  number: string;
  country: string;
  city: string;
  languages: string[];
  profession: string;
  age: number;
  tag: string;
  quote: string;
  title: string;
  bio: string;
  fullStory: string;
  avatarUrl: string;
  spreadImageUrl?: string;
  initials: string;
  isFeatured: boolean;
  isActive: boolean;
  interests?: string[];
  createdAt: string;
}

export interface VolumeEntitlement {
  id: string;
  userId: string;
  volumeId: string;
  status: 'active' | 'pending' | 'rejected' | 'revoked';
  verificationMethod: 'mock' | 'manual' | 'amazon_kdp';
  verificationReference?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface DiaryPost {
  id: string;
  participantId: string;
  volumeId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  visibility: 'public_preview' | 'volume_readers' | 'paid_content' | 'private_draft';
  location?: string;
  tags: string[];
  likesCount: number;
  mediaUrls: string[];
  isPinned: boolean;
  publishedAt: string;
  createdAt: string;
  author?: Participant;
}

export interface PaidContent {
  id: string;
  participantId: string;
  volumeId: string;
  title: string;
  description: string;
  contentType: 'gallery' | 'video' | 'chapter' | 'story_doc';
  priceMinorUnits: number;
  currency: string;
  previewUrl: string;
  fileVaultPath: string;
  status: 'active' | 'draft';
  createdAt: string;
}

export interface ContentPurchase {
  id: string;
  userId: string;
  paidContentId: string;
  amountPaidMinorUnits: number;
  currency: string;
  platformFeeMinorUnits: number;
  authorNetMinorUnits: number;
  status: 'completed' | 'refunded';
  createdAt: string;
  item?: PaidContent;
  author?: Participant | null;
}

export interface ConversationRequest {
  id: string;
  readerId: string;
  participantId: string;
  introMessage: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  respondedAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: string;
  createdAt: string;
}

