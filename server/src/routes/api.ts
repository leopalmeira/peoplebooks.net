import { Router } from 'express';
import {
  login,
  register,
  getMe,
  googleAuth,
  loginSchema,
  registerSchema,
} from '../controllers/authController.js';
import { listVolumes, getVolumeBySlug } from '../controllers/volumeController.js';
import { listPeople, getPersonBySlug } from '../controllers/peopleController.js';
import {
  getDiaryPostById,
  createDiaryPost,
  likePost,
  createPostSchema,
} from '../controllers/diaryController.js';
import {
  requestVolumeVerification,
  getMyEntitlements,
  verifyVolumeSchema,
} from '../controllers/entitlementController.js';
import {
  requestConversation,
  respondToConversation,
  getConversationMessages,
  sendMessage,
  requestChatSchema,
  sendMessageSchema,
} from '../controllers/chatController.js';
import {
  toggleFollow,
  getMyFeed,
  getMyFollowing,
} from '../controllers/followsController.js';
import {
  purchaseContent,
  getMyPurchases,
  purchaseContentSchema,
} from '../controllers/paidContentController.js';
import { getStudioDashboard, requestPayout } from '../controllers/studioController.js';
import {
  getAdminOverview,
  reviewVerificationRequest,
  submitApplication,
} from '../controllers/adminController.js';
import {
  authenticate,
  optionalAuthenticate,
  requireRole,
} from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

// 1. AUTH
router.post('/auth/login', validateRequest(loginSchema), login);
router.post('/auth/register', validateRequest(registerSchema), register);
router.post('/auth/google', googleAuth);
router.get('/auth/me', authenticate, getMe);

// 2. VOLUMES
router.get('/volumes', listVolumes);
router.get('/volumes/:slug', optionalAuthenticate, getVolumeBySlug);

// 3. PEOPLE (24 PROFILES)
router.get('/people', optionalAuthenticate, listPeople);
router.get('/people/:slug', optionalAuthenticate, getPersonBySlug);

// 4. DIARY (LIVING DIARY)
router.get('/diary/posts/:id', optionalAuthenticate, getDiaryPostById);
router.post('/diary/posts', authenticate, validateRequest(createPostSchema), createDiaryPost);
router.post('/diary/posts/:id/like', optionalAuthenticate, likePost);

// 5. VOLUME ENTITLEMENTS & PURCHASE VERIFICATION
router.post('/entitlements/verify', authenticate, validateRequest(verifyVolumeSchema), requestVolumeVerification);
router.get('/entitlements/my', authenticate, getMyEntitlements);

// 6. PRIVATE CHAT & CONVERSATION REQUESTS
router.post('/chat/request', authenticate, validateRequest(requestChatSchema), requestConversation);
router.post('/chat/requests/:requestId/respond', authenticate, respondToConversation);
router.get('/chat/:participantId/messages', authenticate, getConversationMessages);
router.post('/chat/:participantId/send', authenticate, validateRequest(sendMessageSchema), sendMessage);

// 7. FOLLOWS & FEED
router.post('/follows/:participantId', authenticate, toggleFollow);
router.get('/follows/my-feed', authenticate, getMyFeed);
router.get('/follows/my-following', authenticate, getMyFollowing);

// 8. PAID CONTENT & PURCHASES
router.post('/paid-content/purchase', authenticate, validateRequest(purchaseContentSchema), purchaseContent);
router.get('/paid-content/my-purchases', authenticate, getMyPurchases);

// 9. STUDIO (PARTICIPANT DASHBOARD)
router.get('/studio/dashboard', authenticate, getStudioDashboard);
router.post('/studio/payout', authenticate, requestPayout);

// 10. ADMIN & APPLICATIONS
router.get('/admin/overview', authenticate, requireRole(['admin']), getAdminOverview);
router.post('/admin/verifications/:id/review', authenticate, requireRole(['admin']), reviewVerificationRequest);
router.post('/applications', optionalAuthenticate, submitApplication);

export default router;

