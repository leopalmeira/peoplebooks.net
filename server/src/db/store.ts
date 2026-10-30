import fs from 'fs';
import path from 'path';
import {
  User,
  Volume,
  Participant,
  VolumeEntitlement,
  PurchaseVerificationRequest,
  DiaryPost,
  Follow,
  ConversationRequest,
  Message,
  PaidContent,
  ContentPurchase,
  FinancialLedgerEntry,
  ParticipantApplication,
} from '../types/index.js';
import {
  initialUsers,
  initialVolumes,
  initialParticipants,
  initialDiaryPosts,
  initialPaidContents,
  initialEntitlements,
} from './seedData.js';

interface DatabaseData {
  users: User[];
  volumes: Volume[];
  participants: Participant[];
  volumeEntitlements: VolumeEntitlement[];
  purchaseVerificationRequests: PurchaseVerificationRequest[];
  diaryPosts: DiaryPost[];
  follows: Follow[];
  conversationRequests: ConversationRequest[];
  messages: Message[];
  paidContents: PaidContent[];
  contentPurchases: ContentPurchase[];
  financialLedger: FinancialLedgerEntry[];
  participantApplications: ParticipantApplication[];
  auditLogs: any[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class Store {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing db.json, initializing fresh store:', err);
    }

    return {
      users: initialUsers,
      volumes: initialVolumes,
      participants: initialParticipants,
      volumeEntitlements: initialEntitlements,
      purchaseVerificationRequests: [],
      diaryPosts: initialDiaryPosts,
      follows: [
        {
          id: 'f-1',
          followerUserId: 'user-reader-demo',
          participantId: 'juliana',
          createdAt: new Date().toISOString(),
        },
      ],
      conversationRequests: [],
      messages: [],
      paidContents: initialPaidContents,
      contentPurchases: [],
      financialLedger: [],
      participantApplications: [],
      auditLogs: [],
    };
  }

  public save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to db.json:', err);
    }
  }

  // Getters
  get users() { return this.data.users; }
  get volumes() { return this.data.volumes; }
  get participants() { return this.data.participants; }
  get volumeEntitlements() { return this.data.volumeEntitlements; }
  get purchaseVerificationRequests() { return this.data.purchaseVerificationRequests; }
  get diaryPosts() { return this.data.diaryPosts; }
  get follows() { return this.data.follows; }
  get conversationRequests() { return this.data.conversationRequests; }
  get messages() { return this.data.messages; }
  get paidContents() { return this.data.paidContents; }
  get contentPurchases() { return this.data.contentPurchases; }
  get financialLedger() { return this.data.financialLedger; }
  get participantApplications() { return this.data.participantApplications; }
  get auditLogs() { return this.data.auditLogs; }

  // Helpers
  public resetToSeed(): void {
    this.data = {
      users: initialUsers,
      volumes: initialVolumes,
      participants: initialParticipants,
      volumeEntitlements: initialEntitlements,
      purchaseVerificationRequests: [],
      diaryPosts: initialDiaryPosts,
      follows: [],
      conversationRequests: [],
      messages: [],
      paidContents: initialPaidContents,
      contentPurchases: [],
      financialLedger: [],
      participantApplications: [],
      auditLogs: [],
    };
    this.save();
  }
}

export const store = new Store();

