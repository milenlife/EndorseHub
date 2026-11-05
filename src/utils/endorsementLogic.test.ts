import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGES,
  getStageByName,
  getStageByIndex,
  canCreateEndorsement,
  canEditEndorsement,
  canModifyEndorsements,
  canDeleteEndorsement,
  canViewProject,
  generateStageNotification,
  calculateMonthlySummary,
  calculateOverallMetrics,
  formatEndorsementsToSheetRows,
  parseSheetRowsToEndorsements,
} from './endorsementLogic';
import { Endorsement } from '../types/endorsement';

const mockEndorsements: Endorsement[] = [
  {
    id: 'end-01',
    brandName: 'GlowUp Skincare',
    campaignTitle: 'Serum Launch 2026',
    talentName: 'Alya Putri',
    talentEmail: 'alya@creator.com',
    platform: 'Instagram',
    fee: 5000000,
    stage: 'Undangan masuk',
    stageIndex: 0,
    deadline: '2026-10-25',
    paymentStatus: 'unpaid',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'end-02',
    brandName: 'TechGadget Indonesia',
    campaignTitle: 'Wireless Earbuds Review',
    talentName: 'Budi Hartono',
    talentEmail: 'budi@tech.com',
    platform: 'TikTok',
    fee: 8000000,
    stage: 'DONE',
    stageIndex: 9,
    deadline: '2026-10-15',
    paymentStatus: 'paid',
    insights: {
      views: 120000,
      reach: 140000,
      likes: 8500,
      comments: 650,
      engagementRate: 7.6,
    },
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-16T10:00:00Z',
  },
  {
    id: 'end-03',
    brandName: 'FashionStyle Hijab',
    campaignTitle: 'Ramadhan Collection',
    talentName: 'Alya Putri',
    talentEmail: 'alya@creator.com',
    platform: 'Instagram',
    fee: 3500000,
    stage: 'Konten diposting',
    stageIndex: 6,
    deadline: '2026-09-20',
    paymentStatus: 'pending',
    insights: {
      views: 45000,
      reach: 52000,
      likes: 3100,
      comments: 240,
      engagementRate: 7.4,
    },
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-21T10:00:00Z',
  },
];

test('STAGES defines exactly 10 sequential stages matching user requirements', () => {
  assert.equal(STAGES.length, 10);
  assert.equal(STAGES[0].name, 'Undangan masuk');
  assert.equal(STAGES[1].name, 'Masuk grup WhatsApp');
  assert.equal(STAGES[2].name, 'Menyiapkan script');
  assert.equal(STAGES[3].name, 'Membuat draft konten');
  assert.equal(STAGES[4].name, 'Mengirim draft ke grup');
  assert.equal(STAGES[5].name, 'Review / revisi / approval');
  assert.equal(STAGES[6].name, 'Konten diposting');
  assert.equal(STAGES[7].name, 'Mengirim insights');
  assert.equal(STAGES[8].name, 'Menunggu pembayaran');
  assert.equal(STAGES[9].name, 'DONE');
});

test('getStageByName and getStageByIndex return accurate stage references', () => {
  const stageByStr = getStageByName('Konten diposting');
  assert.equal(stageByStr.index, 6);
  assert.equal(stageByStr.icon, 'Share2');

  const stageByIdx = getStageByIndex(9);
  assert.equal(stageByIdx.name, 'DONE');
  assert.equal(stageByIdx.index, 9);
});

test('role-based access control rules protect editing operations', () => {
  // Owner and Admin can edit
  assert.equal(canModifyEndorsements('owner'), true);
  assert.equal(canModifyEndorsements('admin'), true);
  // Talent general edit without endorsement is false
  assert.equal(canModifyEndorsements('talent'), false);

  // All roles (Owner, Admin, Talent) can create endorsements
  assert.equal(canCreateEndorsement('owner'), true);
  assert.equal(canCreateEndorsement('admin'), true);
  assert.equal(canCreateEndorsement('talent'), true);

  // Talent can edit their own endorsements, but not others
  const item = mockEndorsements[0]; // talentEmail: alya@creator.com
  assert.equal(canEditEndorsement('talent', 'alya@creator.com', item), true);
  assert.equal(canEditEndorsement('talent', 'other@creator.com', item), false);
  assert.equal(canEditEndorsement('owner', 'other@creator.com', item), true);
  assert.equal(canEditEndorsement('admin', 'other@creator.com', item), true);

  // Only Owner can delete
  assert.equal(canDeleteEndorsement('owner'), true);
  assert.equal(canDeleteEndorsement('admin'), false);
  assert.equal(canDeleteEndorsement('talent'), false);
});

test('canViewProject isolates project visibility according to talent identity', () => {
  const item = mockEndorsements[0]; // talent: alya@creator.com
  // Admin and Owner see all
  assert.equal(canViewProject('owner', 'mami.elen14@gmail.com', item), true);
  assert.equal(canViewProject('admin', 'admin@agency.com', item), true);
  // Talent can only see their own
  assert.equal(canViewProject('talent', 'alya@creator.com', item), true);
  assert.equal(canViewProject('talent', 'budi@tech.com', item), false);
});

test('generateStageNotification produces complete notifications with audit metadata', () => {
  const item = mockEndorsements[0];
  const notif = generateStageNotification(item, 'Undangan masuk', 'Masuk grup WhatsApp', 'admin@agency.com');

  assert.equal(notif.endorsementId, 'end-01');
  assert.equal(notif.brandName, 'GlowUp Skincare');
  assert.equal(notif.fromStage, 'Undangan masuk');
  assert.equal(notif.toStage, 'Masuk grup WhatsApp');
  assert.equal(notif.read, false);
  assert(notif.message.includes('Masuk grup WhatsApp'));
  assert(notif.message.includes('admin@agency.com'));
});

test('calculateOverallMetrics aggregates total revenue, paid, and engagement rates', () => {
  const metrics = calculateOverallMetrics(mockEndorsements);
  assert.equal(metrics.totalRevenue, 16500000); // 5M + 8M + 3.5M
  assert.equal(metrics.paidRevenue, 8000000); // 8M
  assert.equal(metrics.pendingRevenue, 8500000); // 5M + 3.5M
  assert.equal(metrics.totalDeals, 3);
  assert.equal(metrics.completedDeals, 1);
  assert.equal(metrics.activeDeals, 2);
  assert.equal(metrics.totalViews, 165000); // 120k + 45k
  assert.equal(metrics.avgEngagementRate, 7.5); // (7.6 + 7.4) / 2
});

test('calculateMonthlySummary divides reports cleanly by month and year', () => {
  const summary = calculateMonthlySummary(mockEndorsements);
  assert.equal(summary.length, 2); // 2026-10 and 2026-09
  const oct = summary.find((s) => s.monthYear === '2026-10');
  assert.ok(oct);
  assert.equal(oct?.totalDeals, 2);
  assert.equal(oct?.totalRevenue, 13000000); // 5M + 8M
  assert.equal(oct?.completedDeals, 1);
});

test('formatEndorsementsToSheetRows and parseSheetRowsToEndorsements serialize properly', () => {
  const rows = formatEndorsementsToSheetRows(mockEndorsements);
  assert.equal(rows.length, 4); // 1 header + 3 items
  assert.equal(rows[0][0], 'ID');
  assert.equal(rows[1][1], 'GlowUp Skincare');

  const parsed = parseSheetRowsToEndorsements(rows);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].brandName, 'GlowUp Skincare');
  assert.equal(parsed[1].stage, 'DONE');
  assert.equal(parsed[1].fee, 8000000);
});
