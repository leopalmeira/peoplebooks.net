const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('peoplebooks_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Ocorreu um erro na requisição.',
      response.status,
      data.code,
      data.details
    );
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  googleAuth: (data: { credential?: string; email?: string; name?: string; avatarUrl?: string }) =>
    request<any>('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),

  // Volumes
  getVolumes: () => request<any>('/volumes'),
  getVolumeBySlug: (slug: string) => request<any>(`/volumes/${slug}`),

  // People
  getPeople: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<any>(`/people?${qs}`);
  },
  getPersonBySlug: (slug: string) => request<any>(`/people/${slug}`),

  // Diary
  getDiaryPost: (id: string) => request<any>(`/diary/posts/${id}`),
  createDiaryPost: (postData: any) => request<any>('/diary/posts', { method: 'POST', body: JSON.stringify(postData) }),
  likeDiaryPost: (id: string) => request<any>(`/diary/posts/${id}/like`, { method: 'POST' }),

  // Entitlements
  verifyVolume: (data: { volumeId: string; verificationMethod: string; orderReference: string }) =>
    request<any>('/entitlements/verify', { method: 'POST', body: JSON.stringify(data) }),
  getMyEntitlements: () => request<any>('/entitlements/my'),

  // Follows
  toggleFollow: (participantId: string) => request<any>(`/follows/${participantId}`, { method: 'POST' }),
  getMyFeed: () => request<any>('/follows/my-feed'),
  getMyFollowing: () => request<any>('/follows/my-following'),

  // Chat
  requestChat: (participantId: string, introMessage: string) =>
    request<any>('/chat/request', { method: 'POST', body: JSON.stringify({ participantId, introMessage }) }),
  getChatMessages: (participantId: string) => request<any>(`/chat/${participantId}/messages`),
  sendChatMessage: (participantId: string, content: string) =>
    request<any>(`/chat/${participantId}/send`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Paid Content
  purchaseContent: (contentId: string) =>
    request<any>('/paid-content/purchase', { method: 'POST', body: JSON.stringify({ contentId }) }),
  getMyPurchases: () => request<any>('/paid-content/my-purchases'),

  // Studio
  getStudioDashboard: () => request<any>('/studio/dashboard'),
  requestPayout: (amountMinorUnits: number, pixKey: string) =>
    request<any>('/studio/payout', { method: 'POST', body: JSON.stringify({ amountMinorUnits, pixKey }) }),

  // Admin & Applications
  getAdminOverview: () => request<any>('/admin/overview'),
  reviewVerification: (id: string, action: 'approve' | 'reject', notes?: string) =>
    request<any>(`/admin/verifications/${id}/review`, { method: 'POST', body: JSON.stringify({ action, notes }) }),
  submitApplication: (appData: any) =>
    request<any>('/applications', { method: 'POST', body: JSON.stringify(appData) }),
};

