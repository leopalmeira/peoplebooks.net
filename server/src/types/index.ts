export type UserRole = 'visitor' | 'reader' | 'participant' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  createdAt: string;
}

export interface Volume {
  id: string; // '01', '02', '03'
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
  id: string; // 'juliana', 'gabriel', etc.
  slug: string;
  userId?: string;
  primaryVolumeId: string;
  name: string;
  legalName?: string;
  number: string; // '001', '002', etc.
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

export type EntitlementStatus = 'pending' | 'active' | 'rejected' | 'revoked' | 'expired';

export interface VolumeEntitlement {
  id: string;
  userId: string;
  volumeId: string;
  status: EntitlementStatus;
  verificationMethod: 'mock' | 'manual' | 'amazon_kdp' | 'direct_purchase';
  verificationReference?: string;
  verifiedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  createdAt: string;
}

export interface PurchaseVerificationRequest {
  id: string;
  userId: string;
  volumeId: string;
  provider: 'mock' | 'manual' | 'amazon_kdp';
  orderNumber: string;
  receiptData?: Record<string, any>;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type DiaryVisibility = 'public_preview' | 'volume_readers' | 'paid_content' | 'private_draft';

export interface DiaryPost {
  id: string;
  participantId: string;
  volumeId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  visibility: DiaryVisibility;
  location?: string;
  tags: string[];
  likesCount: number;
  mediaUrls: string[];
  isPinned: boolean;
  publishedAt: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerUserId: string;
  participantId: string;
  createdAt: string;
}

export type ConversationRequestStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface ConversationRequest {
  id: string;
  readerId: string;
  participantId: string;
  introMessage: string;
  status: ConversationRequestStatus;
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

export interface PaidContent {
  id: string;
  participantId: string;
  volumeId: string;
  title: string;
  description: string;
  contentType: 'gallery' | 'video' | 'chapter' | 'story_doc';
  priceMinorUnits: number; // e.g. 990 = R$ 9,90 or $9.90
  currency: string;
  previewUrl: string;
  fileVaultPath: string;
  status: 'active' | 'draft' | 'archived';
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
  paymentMethod: string;
  status: 'completed' | 'refunded';
  createdAt: string;
}

export interface FinancialLedgerEntry {
  id: string;
  participantId: string;
  transactionType: 'sale' | 'payout' | 'refund' | 'adjustment';
  amountMinorUnits: number;
  balanceAfterMinorUnits: number;
  currency: string;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface ParticipantApplication {
  id: string;
  userId?: string;
  publicName: string;
  legalName: string;
  email: string;
  country: string;
  city: string;
  languages: string[];
  profession: string;
  isAdult: boolean;
  storySummary: string;
  interests: string;
  motivation: string;
  conversationAvailability: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewerNotes?: string;
  createdAt: string;
}

