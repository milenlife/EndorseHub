import React from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StageName } from '../types/endorsement';
import { STAGES } from '../utils/endorsementLogic';

interface StageProgressBarProps {
  currentStage: StageName;
  onSelectStage?: (stage: StageName) => void;
  canEdit?: boolean;
  compact?: boolean;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  currentStage,
  onSelectStage,
  canEdit = false,
  compact = false,
}) => {
  const currentIndex = STAGES.findIndex((s) => s.name === currentStage);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">
            Tahap {activeIndex + 1}/10: <span className="text-violet-400">{currentStage}</span>
          </span>
          <span className="text-zinc-500 font-mono">{Math.round(((activeIndex + 1) / 10) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full transition-all duration-500 ${
              currentStage === 'DONE'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500'
            }`}
            style={{ width: `${((activeIndex + 1) / 10) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Mobile-only Quick Stage Selector Dropdown */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-zinc-300">Tahapan Kampanye (1-10):</span>
          <span className="text-[11px] font-bold text-violet-400">
            {activeIndex + 1}/10 ({Math.round(((activeIndex + 1) / 10) * 100)}%)
          </span>
        </div>
        {canEdit ? (
          <select
            value={currentStage}
            onChange={(e) => onSelectStage && onSelectStage(e.target.value as StageName)}
            className="w-full rounded-xl border border-violet-500/40 bg-zinc-900 p-2.5 text-xs font-semibold text-white focus:border-violet-500 focus:outline-none cursor-pointer"
          >
            {STAGES.map((s, idx) => (
              <option key={s.name} value={s.name}>
                Tahap {idx + 1}: {s.name} {idx < activeIndex ? '✓' : idx === activeIndex ? '●' : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 text-xs font-semibold text-white flex items-center justify-between">
            <span>Tahap {activeIndex + 1}: {currentStage}</span>
            <span className="text-[10px] text-zinc-400">Terkunci</span>
          </div>
        )}
      </div>

      {/* 10 Stages Stepper Grid / Horizontal Track (Scrollable & Responsive) */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 snap-x overscroll-x-contain touch-pan-x">
        <div className="flex min-w-[720px] sm:min-w-[840px] items-center justify-between gap-1 sm:gap-2 px-1">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <React.Fragment key={stage.name}>
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => canEdit && onSelectStage && onSelectStage(stage.name)}
                  className={`group relative flex flex-1 flex-col items-center rounded-xl p-2 text-center transition-all snap-center ${
                    canEdit ? 'cursor-pointer hover:bg-zinc-800/60 active:scale-95' : 'cursor-default'
                  } ${
                    isCurrent
                      ? 'bg-zinc-800/95 ring-1 ring-violet-500/60 shadow-lg shadow-violet-500/10'
                      : isCompleted
                      ? 'opacity-85'
                      : 'opacity-40'
                  }`}
                  title={`${stage.name} - ${stage.shortDesc} ${canEdit ? '(Klik untuk ubah tahapan)' : ''}`}
                >
                  {/* Step circle indicator */}
                  <div
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-violet-600 to-pink-500 text-white shadow-md shadow-violet-500/30 scale-110'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
                    ) : isCurrent ? (
                      idx === 9 ? (
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Stage Label */}
                  <span
                    className={`mt-1.5 text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 max-w-[75px] sm:max-w-[85px] ${
                      isCurrent
                        ? 'text-white font-semibold'
                        : isCompleted
                        ? 'text-zinc-300'
                        : 'text-zinc-500'
                    }`}
                  >
                    {stage.name}
                  </span>

                  {isCurrent && (
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
                  )}
                </button>

                {/* Arrow between steps */}
                {idx < STAGES.length - 1 && (
                  <ChevronRight
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 -mx-1 ${
                      idx < activeIndex ? 'text-emerald-500/60' : 'text-zinc-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Current stage explanation card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-xl bg-violet-500/10 p-2 text-violet-400 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">
                Tahap {activeIndex + 1}: {currentStage}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STAGES[activeIndex].badgeColor}`}
              >
                {currentStage === 'DONE' ? 'Selesai' : 'Sedang Berlangsung'}
              </span>
            </div>
            <p className="text-zinc-400 mt-0.5 text-[11px] sm:text-xs">{STAGES[activeIndex].shortDesc}</p>
          </div>
        </div>

        <div className="rounded-xl bg-zinc-950/80 px-3 py-2 border border-zinc-800/80 text-zinc-300 text-[11px] sm:text-xs">
          <span className="font-semibold text-violet-300">Tindakan: </span>
          <span>{STAGES[activeIndex].actionRequired}</span>
        </div>
      </div>
    </div>
  );
};
