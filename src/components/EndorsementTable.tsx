import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Lock,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Endorsement, StageName, UserProfile } from '../types/endorsement';
import {
  canCreateEndorsement,
  canDeleteEndorsement,
  canEditEndorsement,
  canModifyEndorsements,
  formatCurrencyIDR,
  getStageByName,
  STAGES,
} from '../utils/endorsementLogic';

interface EndorsementTableProps {
  endorsements: Endorsement[];
  currentUser: UserProfile;
  onSelectEndorsement: (endorsement: Endorsement) => void;
  onEditEndorsement: (endorsement: Endorsement) => void;
  onDeleteEndorsement: (endorsement: Endorsement) => void;
  onOpenCreateModal: () => void;
}

export const EndorsementTable: React.FC<EndorsementTableProps> = ({
  endorsements,
  currentUser,
  onSelectEndorsement,
  onEditEndorsement,
  onDeleteEndorsement,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const canCreate = canCreateEndorsement(currentUser.role);
  const canDelete = canDeleteEndorsement(currentUser.role);

  // Filter endorsements
  const filtered = endorsements.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !searchQuery ||
      item.brandName.toLowerCase().includes(q) ||
      item.campaignTitle.toLowerCase().includes(q) ||
      item.talentName.toLowerCase().includes(q);

    const matchStage = stageFilter === 'all' || item.stage === stageFilter;
    const matchPlatform = platformFilter === 'all' || item.platform === platformFilter;
    const matchPayment = paymentFilter === 'all' || item.paymentStatus === paymentFilter;

    return matchQuery && matchStage && matchPlatform && matchPayment;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari brand, judul campaign, atau nama talent..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stage Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[11px]">Tahap:</span>
            <select
              value={stageFilter}
              aria-label="Filter berdasarkan tahapan"
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">
                Semua Tahap (1-10)
              </option>
              {STAGES.map((s, idx) => (
                <option key={s.name} value={s.name} className="bg-zinc-900 text-white">
                  {idx + 1}. {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[11px]">Platform:</span>
            <select
              value={platformFilter}
              aria-label="Filter berdasarkan platform"
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">Semua Platform</option>
              <option value="Instagram" className="bg-zinc-900 text-white">Instagram</option>
              <option value="TikTok" className="bg-zinc-900 text-white">TikTok</option>
              <option value="YouTube" className="bg-zinc-900 text-white">YouTube</option>
              <option value="Twitter/X" className="bg-zinc-900 text-white">Twitter/X</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[11px]">Bayar:</span>
            <select
              value={paymentFilter}
              aria-label="Filter status pembayaran"
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">Semua Status</option>
              <option value="paid" className="bg-zinc-900 text-white">Terbayar (Paid)</option>
              <option value="pending" className="bg-zinc-900 text-white">Pending</option>
              <option value="unpaid" className="bg-zinc-900 text-white">Belum Bayar (Unpaid)</option>
            </select>
          </div>

          {canCreate && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th scope="col" className="px-4 py-3.5">Brand & Campaign</th>
                <th scope="col" className="px-4 py-3.5">Talent (Influencer)</th>
                <th scope="col" className="px-4 py-3.5">Platform</th>
                <th scope="col" className="px-4 py-3.5">Nilai Kontrak</th>
                <th scope="col" className="px-4 py-3.5">Tahapan Progres (1-10)</th>
                <th scope="col" className="px-4 py-3.5">Deadline</th>
                <th scope="col" className="px-4 py-3.5">Status Pembayaran</th>
                <th scope="col" className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    Tidak ada endorsement yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const stageInfo = getStageByName(item.stage);
                  const isDone = item.stage === 'DONE';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectEndorsement(item)}
                      className="group cursor-pointer hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Brand & Campaign */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">{item.brandName}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {item.campaignTitle}
                        </div>
                      </td>

                      {/* Talent */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-zinc-200">{item.talentName}</div>
                        <div className="text-[10px] text-zinc-500">{item.talentEmail}</div>
                      </td>

                      {/* Platform */}
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-300">
                          {item.platform}
                        </span>
                      </td>

                      {/* Fee */}
                      <td className="px-4 py-3.5 font-semibold text-emerald-400">
                        {formatCurrencyIDR(item.fee)}
                      </td>

                      {/* Stage (1-10) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${stageInfo.badgeColor}`}
                          >
                            #{stageInfo.index + 1} {item.stage}
                          </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className={`h-full ${
                              isDone ? 'bg-emerald-400' : 'bg-violet-500'
                            }`}
                            style={{ width: `${((stageInfo.index + 1) / 10) * 100}%` }}
                          />
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3.5 text-zinc-300 font-mono text-[11px]">
                        {item.deadline}
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            item.paymentStatus === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : item.paymentStatus === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onSelectEndorsement(item)}
                            title="Buka Detail & Alur 10 Tahapan"
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit button: active for Admin/Owner or Talent editing their own endorsement */}
                          {canEditEndorsement(currentUser.role, currentUser.email, item) ? (
                            <button
                              onClick={() => onEditEndorsement(item)}
                              title="Edit Endorsement Ini"
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-violet-400 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span
                              title="Fitur dikunci: Hanya dapat diedit oleh talent pemilik proyek atau Admin/Owner"
                              className="rounded-lg p-1.5 text-zinc-600 cursor-not-allowed"
                            >
                              <Lock className="h-4 w-4" />
                            </span>
                          )}

                          {/* Delete button: active only for Owner */}
                          {canDelete && (
                            <button
                              onClick={() => onDeleteEndorsement(item)}
                              title="Hapus Endorsement (Hanya Owner)"
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-950/50 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
