import React from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  MessageCircle,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import { Endorsement, StageName, UserProfile } from '../types/endorsement';
import {
  canCreateEndorsement,
  canEditEndorsement,
  canModifyEndorsements,
  formatCurrencyIDR,
  getStageByIndex,
  STAGES,
} from '../utils/endorsementLogic';

interface EndorsementKanbanProps {
  endorsements: Endorsement[];
  currentUser: UserProfile;
  onSelectEndorsement: (endorsement: Endorsement) => void;
  onAdvanceStage: (endorsement: Endorsement) => void;
  onOpenCreateModal: () => void;
}

export const EndorsementKanban: React.FC<EndorsementKanbanProps> = ({
  endorsements,
  currentUser,
  onSelectEndorsement,
  onAdvanceStage,
  onOpenCreateModal,
}) => {
  const canCreate = canCreateEndorsement(currentUser.role);

  return (
    <div className="w-full">
      {/* Kanban Board Container with horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-700">
        {STAGES.map((stage, sIdx) => {
          const itemsInStage = endorsements.filter((e) => e.stage === stage.name);
          const totalFeeInStage = itemsInStage.reduce((acc, curr) => acc + (curr.fee || 0), 0);

          return (
            <div
              key={stage.name}
              className="flex w-76 shrink-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 shadow-md backdrop-blur-sm"
            >
              {/* Column Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-start gap-2">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                      stage.name === 'DONE'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-violet-500/20 text-violet-400'
                    }`}
                  >
                    {sIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">{stage.name}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                      {formatCurrencyIDR(totalFeeInStage)}
                    </p>
                  </div>
                </div>

                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-zinc-800 px-1.5 text-[10px] font-semibold text-zinc-300">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="mt-3 flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {itemsInStage.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-800/80 p-4 text-center">
                    <p className="text-[11px] text-zinc-500">Tidak ada proyek di tahap ini</p>
                  </div>
                ) : (
                  itemsInStage.map((item) => {
                    const isDone = item.stage === 'DONE';

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectEndorsement(item)}
                        className={`group relative rounded-xl border p-3.5 transition-all cursor-pointer hover:border-zinc-700 hover:shadow-lg ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-700/60'
                            : 'bg-zinc-800/70 border-zinc-700/60 hover:bg-zinc-800'
                        }`}
                      >
                        {/* Brand & Platform */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {item.brandName}
                          </span>
                          <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 shrink-0">
                            {item.platform}
                          </span>
                        </div>

                        {/* Campaign title */}
                        <p className="mt-1 text-xs text-zinc-300 line-clamp-2 leading-snug">
                          {item.campaignTitle}
                        </p>

                        {/* Talent & Contract Value */}
                        <div className="mt-2.5 flex items-center justify-between border-t border-zinc-700/50 pt-2 text-[11px]">
                          <div className="flex items-center gap-1 text-zinc-400">
                            <Users className="h-3 w-3" />
                            <span className="truncate max-w-[110px]">{item.talentName}</span>
                          </div>
                          <span className="font-semibold text-emerald-400">
                            {formatCurrencyIDR(item.fee)}
                          </span>
                        </div>

                        {/* Deadline & WhatsApp link */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.deadline}
                          </span>

                          {item.whatsAppGroupLink && (
                            <a
                              href={item.whatsAppGroupLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-emerald-400 hover:underline"
                              title="Buka Grup WhatsApp"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>Grup WA</span>
                            </a>
                          )}
                        </div>

                        {/* Advance Stage button (Owner/Admin or Talent on their own endorsement) */}
                        {canEditEndorsement(currentUser.role, currentUser.email, item) && !isDone && (
                          <div className="mt-3 pt-2 border-t border-zinc-700/40 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdvanceStage(item);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 px-2.5 py-1 text-[10px] font-semibold transition-colors border border-violet-500/30"
                              title={`Lanjutkan ke tahap ${getStageByIndex(sIdx + 1).name}`}
                            >
                              <span>Lanjut Tahap</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Add button at column bottom */}
              {canCreate && sIdx === 0 && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-700 py-2 text-xs font-medium text-zinc-400 hover:border-violet-500 hover:text-violet-300 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Undangan</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
