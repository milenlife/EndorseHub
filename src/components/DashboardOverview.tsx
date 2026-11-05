import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  FileSpreadsheet,
  Filter,
  Heart,
  Layers,
  Plus,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Endorsement, UserProfile } from '../types/endorsement';
import {
  calculateMonthlySummary,
  calculateOverallMetrics,
  canCreateEndorsement,
  canModifyEndorsements,
  formatCurrencyIDR,
  STAGES,
} from '../utils/endorsementLogic';

interface DashboardOverviewProps {
  endorsements: Endorsement[];
  currentUser: UserProfile;
  onOpenCreateModal: () => void;
  onOpenSheetsModal: () => void;
  onSelectEndorsement: (endorsement: Endorsement) => void;
  onGoToTab: (tab: 'dashboard' | 'endorsements' | 'reports' | 'ai-tools') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  endorsements,
  currentUser,
  onOpenCreateModal,
  onOpenSheetsModal,
  onSelectEndorsement,
  onGoToTab,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Filter endorsements if a specific month is selected
  const filteredEndorsements = endorsements.filter((item) => {
    if (selectedMonth === 'all') return true;
    const dateStr = item.deadline || item.createdAt;
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return key === selectedMonth;
  });

  const metrics = calculateOverallMetrics(filteredEndorsements);
  const monthlySummaries = calculateMonthlySummary(endorsements);
  const canCreate = canCreateEndorsement(currentUser.role);
  const isTalent = currentUser.role === 'talent';

  // Group counts by the 10 stages
  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: filteredEndorsements.filter((e) => e.stage === s.name).length,
  }));

  return (
    <div className="space-y-6">
      {/* Talent access notification banner */}
      {isTalent && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 sm:p-4 text-xs text-emerald-200">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-300">
                Mode Akses Talent ({currentUser.displayName})
              </p>
              <p className="text-emerald-200/80 mt-0.5 text-[11px] sm:text-xs">
                Anda dapat menambahkan endorsement baru dan mengelola tahapan proyek atas nama akun Anda sendiri.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Input Endorsement Baru</span>
          </button>
        </div>
      )}

      {/* Header section with monthly filter & action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Dashboard Endorsement
            <span className="rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs px-2.5 py-0.5 font-medium">
              Real-Time
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pantau arus kerjasama influencer, status pembayaran, dan performa konten 10 tahapan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Monthly Filter Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
            <Calendar className="h-4 w-4 text-violet-400" />
            <select
              value={selectedMonth}
              aria-label="Filter berdasarkan bulan"
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">
                Semua Periode ({endorsements.length} Endorsement)
              </option>
              {monthlySummaries.map((m) => (
                <option key={m.monthYear} value={m.monthYear} className="bg-zinc-900 text-white">
                  {m.monthLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Sync Sheets Button (Owner & Admin only) */}
          {!isTalent && (
            <button
              onClick={onOpenSheetsModal}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>Database Sheets</span>
            </button>
          )}

          {/* Add Endorsement Button (Available for Owner, Admin, and Talent) */}
          {canCreate && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90 transition-all shadow-md shadow-violet-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Endorsement</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Nilai Kontrak</span>
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
            {formatCurrencyIDR(metrics.totalRevenue)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>
              Terbayar: <b className="text-emerald-400">{formatCurrencyIDR(metrics.paidRevenue)}</b>
            </span>
          </div>
        </div>

        {/* Pending Revenue */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Menunggu Pembayaran</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-amber-300">
            {formatCurrencyIDR(metrics.pendingRevenue)}
          </p>
          <div className="mt-2 text-[11px] text-zinc-400">
            <span>
              Invoice terbit & proses termin klien
            </span>
          </div>
        </div>

        {/* Deals Active vs Done */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Status Penyelesaian</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white">{metrics.completedDeals}</span>
            <span className="text-xs text-zinc-400 font-medium">/ {metrics.totalDeals} Proyek</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs font-semibold">
              {metrics.completionRate}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Aktif: {metrics.activeDeals} kampanye</span>
            <span className="text-emerald-400">{metrics.completedDeals} DONE</span>
          </div>
        </div>

        {/* Content Performance (Views & ER) */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Views & Engagement</span>
            <div className="rounded-lg bg-pink-500/10 p-2 text-pink-400">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
            {metrics.totalViews.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-normal text-zinc-400">Tayangan</span>
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 text-pink-400 font-semibold">
              <Heart className="h-3 w-3 fill-pink-400" />
              {metrics.avgEngagementRate}% ER Rata-rata
            </span>
          </div>
        </div>
      </div>

      {/* 10-Stage Pipeline Funnel Overview */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-400" />
              Alur Distribusi 10 Tahapan Endorsement
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pemantauan beban kerja kampanye dari undangan hingga tuntas (DONE)
            </p>
          </div>
          <button
            onClick={() => onGoToTab('endorsements')}
            className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            Lihat Semua di Kanban <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 10-Stage Visual Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {stageCounts.map((stage, idx) => (
            <div
              key={stage.name}
              onClick={() => onGoToTab('endorsements')}
              className={`rounded-xl border p-2.5 transition-all cursor-pointer hover:border-zinc-700 flex flex-col justify-between ${
                stage.count > 0
                  ? 'bg-zinc-800/70 border-zinc-700/80 shadow-sm'
                  : 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">#{idx + 1}</span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    stage.count > 0
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {stage.count}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-semibold text-white line-clamp-2 leading-tight">
                {stage.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Active Endorsements List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Endorsement Terbaru yang Berjalan</h2>
            <p className="text-xs text-zinc-400">Klik item untuk membuka detail 10 tahapan dan asisten Gemini AI</p>
          </div>
          <button
            onClick={() => onGoToTab('endorsements')}
            className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            Buka Tabel Lengkap <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {filteredEndorsements.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectEndorsement(item)}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3 hover:bg-zinc-800/40 px-3 rounded-xl transition-all cursor-pointer gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 font-bold text-white text-sm">
                  {item.brandName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{item.brandName}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                      {item.platform}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.campaignTitle}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pl-13 sm:pl-0">
                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-white block">
                    {formatCurrencyIDR(item.fee)}
                  </span>
                  <span className="text-[11px] text-zinc-400">Talent: {item.talentName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      item.stage === 'DONE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                    }`}
                  >
                    {item.stage}
                  </span>
                  <span className="text-zinc-600 hidden sm:inline">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
