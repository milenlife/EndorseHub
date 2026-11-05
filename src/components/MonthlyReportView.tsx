import React, { useState } from 'react';
import {
  ArrowDownToLine,
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  Heart,
  Layers,
  PieChart,
  Printer,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Endorsement, UserProfile } from '../types/endorsement';
import {
  calculateMonthlySummary,
  calculateOverallMetrics,
  formatCurrencyIDR,
} from '../utils/endorsementLogic';

interface MonthlyReportViewProps {
  endorsements: Endorsement[];
  currentUser?: UserProfile;
  onOpenSheetsModal: () => void;
  onSelectEndorsement: (endorsement: Endorsement) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  endorsements,
  currentUser,
  onOpenSheetsModal,
  onSelectEndorsement,
}) => {
  const summaries = calculateMonthlySummary(endorsements);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(
    summaries[0]?.monthYear || '2026-10'
  );

  const activeSummary =
    summaries.find((s) => s.monthYear === selectedMonthYear) || summaries[0];

  // Endorsements belonging to this month
  const monthlyEndorsements = endorsements.filter((e) => {
    const d = new Date(e.deadline || e.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return key === selectedMonthYear;
  });

  const metrics = calculateOverallMetrics(monthlyEndorsements);

  // Platform breakdown
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X'] as const;
  const platformStats = platforms.map((p) => {
    const items = monthlyEndorsements.filter((e) => e.platform === p);
    const fee = items.reduce((acc, curr) => acc + (curr.fee || 0), 0);
    const views = items.reduce((acc, curr) => acc + (curr.insights?.views || 0), 0);
    return { platform: p, count: items.length, fee, views };
  });

  // Talent leaderboard
  const talentMap = new Map<
    string,
    { name: string; email: string; totalFee: number; count: number; completedCount: number }
  >();
  for (const item of monthlyEndorsements) {
    if (!talentMap.has(item.talentEmail)) {
      talentMap.set(item.talentEmail, {
        name: item.talentName,
        email: item.talentEmail,
        totalFee: 0,
        count: 0,
        completedCount: 0,
      });
    }
    const t = talentMap.get(item.talentEmail)!;
    t.totalFee += item.fee;
    t.count += 1;
    if (item.stage === 'DONE') t.completedCount += 1;
  }
  const talentRankings = Array.from(talentMap.values()).sort((a, b) => b.totalFee - a.totalFee);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Laporan Kinerja & Keuangan Bulanan
            <span className="rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 font-semibold">
              Financial & Content ROI
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Analisis pendapatan agensi, pembayaran termin, dan efektivitas jangkauan influencer
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
            <Calendar className="h-4 w-4 text-amber-400" />
            <select
              value={selectedMonthYear}
              aria-label="Pilih bulan laporan"
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer"
            >
              {summaries.map((s) => (
                <option key={s.monthYear} value={s.monthYear} className="bg-zinc-900 text-white">
                  {s.monthLabel}
                </option>
              ))}
            </select>
          </div>

          {currentUser?.role !== 'talent' && (
            <button
              onClick={onOpenSheetsModal}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>Sinkronkan ke Google Sheets</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Monthly Revenue */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Total Pendapatan ({activeSummary?.monthLabel})</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {formatCurrencyIDR(metrics.totalRevenue)}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2">
            <span>
              Lunas:{' '}
              <strong className="text-emerald-400">{formatCurrencyIDR(metrics.paidRevenue)}</strong>
            </span>
            <span>
              Pending:{' '}
              <strong className="text-amber-400">{formatCurrencyIDR(metrics.pendingRevenue)}</strong>
            </span>
          </div>
        </div>

        {/* Total Reach & Engagement */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Total Tayangan (Views)</span>
            <div className="rounded-lg bg-pink-500/10 p-2 text-pink-400">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {metrics.totalViews.toLocaleString('id-ID')}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2">
            <span>Reach: {metrics.totalReach.toLocaleString('id-ID')}</span>
            <span className="text-pink-400 font-semibold">{metrics.avgEngagementRate}% Avg ER</span>
          </div>
        </div>

        {/* Project Delivery Rate */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Penyelesaian Kampanye</span>
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {metrics.completedDeals}{' '}
            <span className="text-sm font-normal text-zinc-400">
              / {metrics.totalDeals} Proyek Selesai
            </span>
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2">
            <span>Tingkat Keberhasilan:</span>
            <span className="text-violet-300 font-bold">{metrics.completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Platform Breakdown & Talent Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-violet-400" />
            Distribusi Platform & Nilai Kontrak
          </h2>

          <div className="space-y-3.5">
            {platformStats.map((stat) => {
              const percentage =
                metrics.totalRevenue > 0
                  ? Math.round((stat.fee / metrics.totalRevenue) * 100)
                  : 0;

              return (
                <div key={stat.platform} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{stat.platform}</span>
                    <span className="text-zinc-400">
                      {formatCurrencyIDR(stat.fee)} ({percentage}%) • {stat.count} campaign
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stat.platform === 'Instagram'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                          : stat.platform === 'TikTok'
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                          : stat.platform === 'YouTube'
                          ? 'bg-gradient-to-r from-red-500 to-amber-500'
                          : 'bg-zinc-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Talent Leaderboard Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-amber-400" />
            Leaderboard Talent (Influencer Teratas)
          </h2>

          <div className="divide-y divide-zinc-800/80">
            {talentRankings.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                Tidak ada data talent pada bulan ini.
              </p>
            ) : (
              talentRankings.map((talent, idx) => (
                <div key={talent.email} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                          : idx === 1
                          ? 'bg-zinc-300 text-zinc-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{talent.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        {talent.count} Proyek ({talent.completedCount} DONE)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400">
                    {formatCurrencyIDR(talent.totalFee)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Endorsements Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-white mb-3">
          Rincian Proyek Bulan {activeSummary?.monthLabel} ({monthlyEndorsements.length} Endorsement)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 text-zinc-400 text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Brand & Campaign</th>
                <th className="py-2.5 px-3">Talent</th>
                <th className="py-2.5 px-3">Platform</th>
                <th className="py-2.5 px-3">Fee</th>
                <th className="py-2.5 px-3">Tahap</th>
                <th className="py-2.5 px-3">Views</th>
                <th className="py-2.5 px-3">ER (%)</th>
                <th className="py-2.5 px-3">Status Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {monthlyEndorsements.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => onSelectEndorsement(e)}
                  className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-white">{e.brandName}</td>
                  <td className="py-3 px-3 text-zinc-300">{e.talentName}</td>
                  <td className="py-3 px-3 text-zinc-400">{e.platform}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-400">
                    {formatCurrencyIDR(e.fee)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                      {e.stage}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-300">
                    {e.insights?.views?.toLocaleString('id-ID') || '-'}
                  </td>
                  <td className="py-3 px-3 text-pink-400 font-semibold">
                    {e.insights?.engagementRate ? `${e.insights.engagementRate}%` : '-'}
                  </td>
                  <td className="py-3 px-3 uppercase text-[10px] font-bold text-zinc-400">
                    {e.paymentStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
