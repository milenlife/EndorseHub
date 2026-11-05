import {
  AuditLogItem,
  Endorsement,
  MonthlyFinancialSummary,
  NotificationItem,
  StageInfo,
  StageName,
  UserRole,
} from '../types/endorsement';

export const STAGES: StageInfo[] = [
  {
    index: 0,
    name: 'Undangan masuk',
    shortDesc: 'Brand mengirim brief & penawaran kerjasama awal',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: 'MailOpen',
    actionRequired: 'Konfirmasi ketersediaan & negosiasi rate card',
  },
  {
    index: 1,
    name: 'Masuk grup WhatsApp',
    shortDesc: 'Talent & PIC Brand join grup koordinasi WhatsApp',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: 'MessageSquare',
    actionRequired: 'Pastikan talent & admin bergabung di grup WA',
  },
  {
    index: 2,
    name: 'Menyiapkan script',
    shortDesc: 'Menulis outline storyline, key message & USP produk',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    icon: 'FileText',
    actionRequired: 'Kirim script/storyline ke brand untuk approval script',
  },
  {
    index: 3,
    name: 'Membuat draft konten',
    shortDesc: 'Proses shooting, dubbing, dan editing video/foto',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: 'Video',
    actionRequired: 'Produksi video sesuai script yang telah disetujui',
  },
  {
    index: 4,
    name: 'Mengirim draft ke grup',
    shortDesc: 'Upload video draft ke Google Drive / kirim ke grup WA',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    icon: 'Send',
    actionRequired: 'Kirim tautan preview video berkualitas HD ke klien',
  },
  {
    index: 5,
    name: 'Review / revisi / approval',
    shortDesc: 'Klien meninjau draft (revisi maksimal 2x jika ada)',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    icon: 'CheckSquare',
    actionRequired: 'Periksa masukan klien atau terima Final Approval',
  },
  {
    index: 6,
    name: 'Konten diposting',
    shortDesc: 'Video/foto live di Instagram/TikTok/YouTube talent',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    icon: 'Share2',
    actionRequired: 'Lampirkan URL postingan live & tag akun brand',
  },
  {
    index: 7,
    name: 'Mengirim insights',
    shortDesc: 'Tarik analytics 24-48 jam (Views, Reach, Likes, CTR)',
    badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
    icon: 'BarChart2',
    actionRequired: 'Kirim tangkapan layar / angka insights ke brand',
  },
  {
    index: 8,
    name: 'Menunggu pembayaran',
    shortDesc: 'Invoice terkirim, menunggu proses transfer termin/lunas',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    icon: 'DollarSign',
    actionRequired: 'Follow up finance brand & verifikasi bukti transfer',
  },
  {
    index: 9,
    name: 'DONE',
    shortDesc: 'Seluruh kewajiban selesai, dana diterima & diarsip',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    icon: 'CheckCircle2',
    actionRequired: 'Proyek sukses tuntas! Evaluasi performa kampanye',
  },
];

export function getStageByName(name: StageName): StageInfo {
  const found = STAGES.find((s) => s.name === name);
  return found || STAGES[0];
}

export function getStageByIndex(index: number): StageInfo {
  if (index < 0) return STAGES[0];
  if (index >= STAGES.length) return STAGES[STAGES.length - 1];
  return STAGES[index];
}

/**
 * Check if the user can create a new endorsement.
 * Owner, Admin, and Talent can now create endorsements.
 */
export function canCreateEndorsement(role: UserRole): boolean {
  return role === 'owner' || role === 'admin' || role === 'talent';
}

/**
 * Check if the user has permission to edit a specific endorsement.
 * Owner & Admin can edit all.
 * Talent can edit endorsements where talentEmail matches their logged-in email.
 */
export function canEditEndorsement(
  role: UserRole,
  userEmail: string | undefined,
  endorsement: Endorsement
): boolean {
  if (role === 'owner' || role === 'admin') return true;
  if (!userEmail || !endorsement.talentEmail) return false;
  return endorsement.talentEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();
}

/**
 * General check for edit permission. Kept backwards compatible.
 */
export function canModifyEndorsements(
  role: UserRole,
  userEmail?: string,
  endorsement?: Endorsement
): boolean {
  if (role === 'owner' || role === 'admin') return true;
  if (role === 'talent' && endorsement && userEmail) {
    return canEditEndorsement(role, userEmail, endorsement);
  }
  return false;
}

/**
 * Check if user can delete endorsements or manage system roles.
 * Only Owner can perform destructive actions.
 */
export function canDeleteEndorsement(role: UserRole): boolean {
  return role === 'owner';
}

/**
 * Check if user can view a specific endorsement project.
 * Owner and Admin can view all. Talent can only view projects assigned to their email.
 */
export function canViewProject(
  role: UserRole,
  userEmail: string | undefined,
  endorsement: Endorsement
): boolean {
  if (role === 'owner' || role === 'admin') return true;
  if (!userEmail) return false;
  return endorsement.talentEmail.toLowerCase() === userEmail.toLowerCase();
}

/**
 * Generates an automated notification when an endorsement moves to another stage.
 */
export function generateStageNotification(
  endorsement: Endorsement,
  fromStage: StageName,
  toStage: StageName,
  actorEmail: string
): NotificationItem {
  const stageInfo = getStageByName(toStage);
  const now = new Date().toISOString();
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let customAction = stageInfo.actionRequired;
  if (toStage === 'DONE') {
    customAction = 'Pembayaran telah tuntas dan kampanye selesai dengan sukses!';
  } else if (toStage === 'Konten diposting') {
    customAction = `Konten untuk ${endorsement.brandName} telah diposting. Bersiap rekap insight dalam 24-48 jam.`;
  }

  return {
    id,
    recipientEmail: endorsement.talentEmail,
    recipientRole: 'all',
    endorsementId: endorsement.id,
    brandName: endorsement.brandName,
    title: `Tahapan Berubah: ${toStage} (${endorsement.brandName})`,
    message: `Endorsement "${endorsement.campaignTitle}" berpindah dari [${fromStage}] ke [${toStage}]. Langkah selanjutnya: ${customAction}. (Diperbarui oleh: ${actorEmail})`,
    fromStage,
    toStage,
    read: false,
    createdAt: now,
  };
}

/**
 * Generates an audit log entry for changes.
 */
export function createAuditLog(
  endorsementId: string,
  action: string,
  actorEmail: string,
  actorRole: UserRole,
  description: string
): AuditLogItem {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    endorsementId,
    action,
    actorEmail,
    actorRole,
    description,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Formats IDR currency
 */
export function formatCurrencyIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Aggregates monthly performance and financial data.
 */
export function calculateMonthlySummary(endorsements: Endorsement[]): MonthlyFinancialSummary[] {
  const map = new Map<string, MonthlyFinancialSummary>();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  for (const item of endorsements) {
    const dateStr = item.deadline || item.createdAt;
    const date = new Date(dateStr);
    const validDate = isNaN(date.getTime()) ? new Date() : date;
    const year = validDate.getFullYear();
    const month = validDate.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = `${monthNames[month]} ${year}`;

    if (!map.has(key)) {
      map.set(key, {
        monthYear: key,
        monthLabel: label,
        totalDeals: 0,
        completedDeals: 0,
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
        avgEngagementRate: 0,
        totalViews: 0,
      });
    }

    const current = map.get(key)!;
    current.totalDeals += 1;
    current.totalRevenue += item.fee;

    if (item.stage === 'DONE') {
      current.completedDeals += 1;
    }

    if (item.paymentStatus === 'paid') {
      current.paidRevenue += item.fee;
    } else {
      current.pendingRevenue += item.fee;
    }

    if (item.insights) {
      current.totalViews += item.insights.views || 0;
    }
  }

  // Calculate avg engagement rate per month
  const result = Array.from(map.values()).sort((a, b) => b.monthYear.localeCompare(a.monthYear));
  for (const sum of result) {
    const monthlyEndorsements = endorsements.filter((e) => {
      const d = new Date(e.deadline || e.createdAt);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return k === sum.monthYear && e.insights?.engagementRate;
    });

    if (monthlyEndorsements.length > 0) {
      const totalRate = monthlyEndorsements.reduce((acc, curr) => acc + (curr.insights?.engagementRate || 0), 0);
      sum.avgEngagementRate = Number((totalRate / monthlyEndorsements.length).toFixed(2));
    }
  }

  return result;
}

/**
 * Calculates global dashboard statistics
 */
export function calculateOverallMetrics(endorsements: Endorsement[]) {
  const totalRevenue = endorsements.reduce((acc, curr) => acc + (curr.fee || 0), 0);
  const paidRevenue = endorsements
    .filter((e) => e.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + (curr.fee || 0), 0);
  const pendingRevenue = totalRevenue - paidRevenue;

  const totalDeals = endorsements.length;
  const completedDeals = endorsements.filter((e) => e.stage === 'DONE').length;
  const activeDeals = totalDeals - completedDeals;

  const itemsWithInsights = endorsements.filter((e) => e.insights && e.insights.views > 0);
  const totalViews = itemsWithInsights.reduce((acc, curr) => acc + (curr.insights?.views || 0), 0);
  const totalReach = itemsWithInsights.reduce((acc, curr) => acc + (curr.insights?.reach || 0), 0);
  const totalLikes = itemsWithInsights.reduce((acc, curr) => acc + (curr.insights?.likes || 0), 0);
  const totalComments = itemsWithInsights.reduce((acc, curr) => acc + (curr.insights?.comments || 0), 0);

  const avgEngagementRate =
    itemsWithInsights.length > 0
      ? Number(
          (
            itemsWithInsights.reduce((acc, curr) => acc + (curr.insights?.engagementRate || 0), 0) /
            itemsWithInsights.length
          ).toFixed(2)
        )
      : 0;

  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    totalDeals,
    activeDeals,
    completedDeals,
    completionRate: totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0,
    totalViews,
    totalReach,
    totalLikes,
    totalComments,
    avgEngagementRate,
  };
}

/**
 * Google Sheets format converter
 */
export const GOOGLE_SHEETS_HEADERS = [
  'ID',
  'Nama Brand',
  'Judul Campaign',
  'Nama Talent',
  'Email Talent',
  'Platform',
  'Nilai Kontrak (IDR)',
  'Tahapan Saat Ini',
  'Tenggat Waktu',
  'Status Pembayaran',
  'Link WhatsApp Group',
  'Link Konten',
  'Views',
  'Engagement Rate (%)',
  'Catatan',
  'Terakhir Diperbarui',
];

export function formatEndorsementsToSheetRows(endorsements: Endorsement[]): (string | number)[][] {
  const dataRows = endorsements.map((e) => [
    e.id,
    e.brandName,
    e.campaignTitle,
    e.talentName,
    e.talentEmail,
    e.platform,
    e.fee,
    e.stage,
    e.deadline,
    e.paymentStatus,
    e.whatsAppGroupLink || '',
    e.postedUrl || e.draftUrl || '',
    e.insights?.views || 0,
    e.insights?.engagementRate || 0,
    e.notes || '',
    e.updatedAt || new Date().toISOString(),
  ]);

  return [GOOGLE_SHEETS_HEADERS, ...dataRows];
}

export function parseSheetRowsToEndorsements(
  rows: (string | number)[][]
): Partial<Endorsement>[] {
  if (!rows || rows.length <= 1) return [];

  // Skip headers row
  const contentRows = rows.slice(1);
  return contentRows
    .map((row) => {
      const id = String(row[0] || '').trim();
      const brandName = String(row[1] || '').trim();
      const campaignTitle = String(row[2] || '').trim();
      if (!brandName && !campaignTitle) return null;

      const talentName = String(row[3] || 'Talent');
      const talentEmail = String(row[4] || '');
      const platform = (['Instagram', 'TikTok', 'YouTube', 'Twitter/X'].includes(String(row[5]))
        ? String(row[5])
        : 'Instagram') as Endorsement['platform'];
      const fee = Number(String(row[6]).replace(/[^0-9]/g, '')) || 0;
      const stageStr = String(row[7] || 'Undangan masuk');
      const stageInfo = getStageByName(stageStr as StageName);
      const deadline = String(row[8] || new Date().toISOString().split('T')[0]);
      const paymentStatus = ['paid', 'pending', 'unpaid'].includes(String(row[9]).toLowerCase())
        ? (String(row[9]).toLowerCase() as Endorsement['paymentStatus'])
        : 'unpaid';
      const whatsAppGroupLink = String(row[10] || '');
      const postedUrl = String(row[11] || '');
      const views = Number(row[12]) || 0;
      const engagementRate = Number(row[13]) || 0;
      const notes = String(row[14] || '');

      const endorsement: Partial<Endorsement> = {
        id: id || `end_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        brandName,
        campaignTitle,
        talentName,
        talentEmail,
        platform,
        fee,
        stage: stageInfo.name,
        stageIndex: stageInfo.index,
        deadline,
        paymentStatus,
        whatsAppGroupLink,
        postedUrl,
        notes,
        insights: {
          views,
          reach: Math.round(views * 1.15),
          likes: Math.round((views * engagementRate) / 100 * 0.85),
          comments: Math.round((views * engagementRate) / 100 * 0.15),
          engagementRate,
        },
        updatedAt: new Date().toISOString(),
      };

      return endorsement;
    })
    .filter((item): item is Partial<Endorsement> => item !== null);
}
