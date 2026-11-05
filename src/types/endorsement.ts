export type UserRole = 'owner' | 'admin' | 'talent';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  category?: string;
  phone?: string;
  address?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export type StageName =
  | 'Undangan masuk'
  | 'Masuk grup WhatsApp'
  | 'Menyiapkan script'
  | 'Membuat draft konten'
  | 'Mengirim draft ke grup'
  | 'Review / revisi / approval'
  | 'Konten diposting'
  | 'Mengirim insights'
  | 'Menunggu pembayaran'
  | 'DONE';

export interface StageInfo {
  index: number;
  name: StageName;
  shortDesc: string;
  badgeColor: string;
  icon: string;
  actionRequired: string;
}

export interface ContentInsights {
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  saves?: number;
  reach: number;
  engagementRate: number; // percentage, e.g. 4.8%
  impressions?: number;
}

export interface Endorsement {
  id: string;
  brandName: string;
  campaignTitle: string;
  talentId?: string;
  talentName: string;
  talentEmail: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter/X';
  fee: number; // in IDR
  stage: StageName;
  stageIndex: number; // 0 to 9
  deadline: string; // YYYY-MM-DD
  whatsAppGroupLink?: string;
  scriptContent?: string;
  draftUrl?: string;
  postedUrl?: string;
  insights?: ContentInsights;
  paymentStatus: 'unpaid' | 'pending' | 'paid';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  recipientEmail?: string;
  recipientRole?: UserRole | 'all';
  endorsementId: string;
  brandName: string;
  title: string;
  message: string;
  fromStage?: StageName;
  toStage: StageName;
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  endorsementId: string;
  action: string;
  actorEmail: string;
  actorRole: UserRole;
  description: string;
  timestamp: string;
}

export interface MonthlyFinancialSummary {
  monthYear: string; // "2026-10"
  monthLabel: string; // "Oktober 2026"
  totalDeals: number;
  completedDeals: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  avgEngagementRate: number;
  totalViews: number;
}
