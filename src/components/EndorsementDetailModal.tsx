import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  HelpCircle,
  Lock,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  User,
  Video,
  X,
} from 'lucide-react';
import {
  AuditLogItem,
  Endorsement,
  StageName,
  UserProfile,
} from '../types/endorsement';
import {
  analyzeCampaignInsights,
  generateInfluencerScript,
  generateWhatsAppMessage,
  reviewDraftCompliance,
} from '../services/gemini';
import {
  canEditEndorsement,
  canModifyEndorsements,
  formatCurrencyIDR,
  getStageByIndex,
  getStageByName,
  STAGES,
} from '../utils/endorsementLogic';
import { StageProgressBar } from './StageProgressBar';

interface EndorsementDetailModalProps {
  endorsement: Endorsement;
  currentUser: UserProfile;
  auditLogs: AuditLogItem[];
  onClose: () => void;
  onUpdateStage: (endorsement: Endorsement, newStage: StageName) => void;
  onUpdateEndorsement: (updated: Endorsement) => void;
}

export const EndorsementDetailModal: React.FC<EndorsementDetailModalProps> = ({
  endorsement,
  currentUser,
  auditLogs,
  onClose,
  onUpdateStage,
  onUpdateEndorsement,
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'script' | 'whatsapp' | 'insights'>('flow');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Gemini state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [uspInput, setUspInput] = useState('Tekstur ringan, tidak lengket, hasil glowing natural, sertifikasi BPOM halal.');
  const [aiScriptResult, setAiScriptResult] = useState(endorsement.scriptContent || '');
  const [complianceResult, setComplianceResult] = useState<{
    complianceScore: number;
    verdict: string;
    feedback: string;
  } | null>(null);
  const [waRecipient, setWaRecipient] = useState<'brand' | 'talent'>('talent');
  const [waMessage, setWaMessage] = useState('');
  const [aiInsightAnalysis, setAiInsightAnalysis] = useState('');

  // Editable insights state
  const [editInsights, setEditInsights] = useState({
    views: endorsement.insights?.views || 0,
    reach: endorsement.insights?.reach || 0,
    likes: endorsement.insights?.likes || 0,
    comments: endorsement.insights?.comments || 0,
    engagementRate: endorsement.insights?.engagementRate || 0,
  });

  // Strict RBAC: Owner & Admin can edit all; Talent can edit their own endorsement!
  const canEdit = canEditEndorsement(currentUser.role, currentUser.email, endorsement);
  const stageInfo = getStageByName(endorsement.stage);
  const currentIdx = stageInfo.index;

  // Lock background body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Handle stage navigation
  const handleAdvance = () => {
    if (!canEdit || currentIdx >= 9) return;
    const nextStage = getStageByIndex(currentIdx + 1).name;
    onUpdateStage(endorsement, nextStage);
  };

  const handleRevert = () => {
    if (!canEdit || currentIdx <= 0) return;
    const prevStage = getStageByIndex(currentIdx - 1).name;
    onUpdateStage(endorsement, prevStage);
  };

  // Trigger Gemini AI Script Generation
  const handleGenerateScript = async () => {
    setIsAiLoading(true);
    try {
      const script = await generateInfluencerScript({
        brandName: endorsement.brandName,
        campaignTitle: endorsement.campaignTitle,
        platform: endorsement.platform,
        uspPoints: uspInput,
      });
      setAiScriptResult(script);
      // Auto save script to endorsement if editable
      if (canEdit) {
        onUpdateEndorsement({
          ...endorsement,
          scriptContent: script,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger Gemini AI Compliance Review
  const handleReviewCompliance = async () => {
    setIsAiLoading(true);
    try {
      const res = await reviewDraftCompliance(
        aiScriptResult || endorsement.scriptContent || 'Tidak ada draft',
        endorsement.notes || 'Brief: Sampaikan keunggulan produk secara organik dan sertakan hashtag wajib.'
      );
      setComplianceResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger Gemini WhatsApp Message
  const handleGenerateWhatsApp = async () => {
    setIsAiLoading(true);
    try {
      const msg = await generateWhatsAppMessage({
        stage: endorsement.stage,
        brandName: endorsement.brandName,
        campaignTitle: endorsement.campaignTitle,
        talentName: endorsement.talentName,
        recipient: waRecipient,
        notes: endorsement.notes,
      });
      setWaMessage(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger Gemini Performance Analysis
  const handleAnalyzeInsights = async () => {
    setIsAiLoading(true);
    try {
      const analysis = await analyzeCampaignInsights(endorsement);
      setAiInsightAnalysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Save manual insights
  const handleSaveInsights = () => {
    if (!canEdit) return;
    const views = Number(editInsights.views) || 0;
    const likes = Number(editInsights.likes) || 0;
    const comments = Number(editInsights.comments) || 0;
    const calculatedER =
      views > 0 ? Number((((likes + comments) / views) * 100).toFixed(2)) : 0;

    onUpdateEndorsement({
      ...endorsement,
      insights: {
        views,
        reach: Number(editInsights.reach) || Math.round(views * 1.15),
        likes,
        comments,
        engagementRate: calculatedER || editInsights.engagementRate,
      },
    });
  };

  const filteredLogs = auditLogs.filter((log) => log.endorsementId === endorsement.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-hidden">
      <div className="relative flex flex-col w-full max-w-5xl lg:max-w-6xl max-h-[94vh] sm:max-h-[92vh] h-[94vh] sm:h-auto rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="shrink-0 flex items-start justify-between border-b border-zinc-800 p-4 sm:p-6 bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="rounded-lg bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                {endorsement.platform}
              </span>
              <span
                className={`rounded-full border px-2.5 sm:px-3 py-0.5 text-xs font-bold ${stageInfo.badgeColor}`}
              >
                Tahap {currentIdx + 1}/10: {endorsement.stage}
              </span>

              {!canEdit && (
                <span className="flex items-center gap-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold">
                  <Lock className="h-3 w-3" />
                  Mode Lihat (Bukan Admin)
                </span>
              )}
            </div>

            <h2 className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-white line-clamp-1">
              {endorsement.brandName}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{endorsement.campaignTitle}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Detail Endorsement"
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Unified Scrollable Container: Stepper, Sticky Tabs, and Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
          {/* 10-Stage Stepper Header */}
          <div className="border-b border-zinc-800/80 bg-zinc-900/30 px-4 sm:px-7 py-3.5 sm:py-4">
            <StageProgressBar
              currentStage={endorsement.stage}
              canEdit={canEdit}
              onSelectStage={(newStage) => onUpdateStage(endorsement, newStage)}
            />

            {/* Quick Stage Controls */}
            {canEdit && (
              <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-zinc-800/60">
                <button
                  type="button"
                  disabled={currentIdx <= 0}
                  onClick={handleRevert}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Tahap Sebelumnya</span>
                </button>

                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  Klik ikon tahapan di atas untuk langsung beralih tahapan
                </span>

                <button
                  type="button"
                  disabled={currentIdx >= 9}
                  onClick={handleAdvance}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-violet-600/20 transition-all"
                >
                  <span>Lanjut ke Tahap #{currentIdx + 2}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Modal Navigation Tabs (Sticky right beneath header) */}
          <div className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-3 sm:px-6 py-2.5">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-700">
              <button
                onClick={() => setActiveTab('flow')}
                className={`flex-1 min-w-[180px] sm:min-w-[220px] flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 sm:px-6 text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'flow'
                    ? 'bg-zinc-800 text-white ring-1 ring-violet-500/60 shadow-lg shadow-violet-500/10'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Clock className="h-4.5 w-4.5 text-violet-400 shrink-0" />
                <span className="whitespace-nowrap">Alur & Detail Kampanye</span>
              </button>

              <button
                onClick={() => setActiveTab('script')}
                className={`flex-1 min-w-[180px] sm:min-w-[220px] flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 sm:px-6 text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'script'
                    ? 'bg-zinc-800 text-white ring-1 ring-pink-500/60 shadow-lg shadow-pink-500/10'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="h-4.5 w-4.5 text-pink-400 shrink-0" />
                <span className="whitespace-nowrap">Asisten AI & Script</span>
              </button>

              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-1 min-w-[180px] sm:min-w-[220px] flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 sm:px-6 text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'whatsapp'
                    ? 'bg-zinc-800 text-white ring-1 ring-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <MessageCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">WhatsApp Generator</span>
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 min-w-[180px] sm:min-w-[220px] flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 sm:px-6 text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'insights'
                    ? 'bg-zinc-800 text-white ring-1 ring-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Share2 className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                <span className="whitespace-nowrap">Insights & Pembayaran</span>
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-4 sm:p-6 space-y-6">
          {/* TAB 1: Alur & Detail Kampanye */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              {/* Key metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                  <span className="text-[11px] text-zinc-400">Talent</span>
                  <p className="mt-1 font-semibold text-white text-sm">{endorsement.talentName}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{endorsement.talentEmail}</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                  <span className="text-[11px] text-zinc-400">Nilai Kontrak</span>
                  <p className="mt-1 font-bold text-emerald-400 text-sm">
                    {formatCurrencyIDR(endorsement.fee)}
                  </p>
                  <p className="text-[10px] text-zinc-500 capitalize">{endorsement.paymentStatus}</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                  <span className="text-[11px] text-zinc-400">Tenggat Waktu</span>
                  <p className="mt-1 font-semibold text-white text-sm">{endorsement.deadline}</p>
                  <p className="text-[10px] text-zinc-500">Batas akhir serah terima</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                  <span className="text-[11px] text-zinc-400">Grup WhatsApp</span>
                  {endorsement.whatsAppGroupLink ? (
                    <a
                      href={endorsement.whatsAppGroupLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1 text-emerald-400 text-xs font-semibold hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Buka Grup WA</span>
                    </a>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-500">Belum disematkan</p>
                  )}
                  <p className="text-[10px] text-zinc-500">Koordinasi tim & brand</p>
                </div>
              </div>

              {/* Brief / Notes */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-400" />
                  Catatan Briefing & Arahan Brand
                </h3>
                <p className="mt-2 text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                  {endorsement.notes || 'Tidak ada catatan briefing tambahan.'}
                </p>
              </div>

              {/* Links preview (Draft & Posted URL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                  <span className="text-xs font-semibold text-zinc-300">Tautan Draft Video:</span>
                  {endorsement.draftUrl ? (
                    <a
                      href={endorsement.draftUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1.5 text-xs text-violet-400 hover:underline break-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span>{endorsement.draftUrl}</span>
                    </a>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-500">Draft belum diupload</p>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                  <span className="text-xs font-semibold text-zinc-300">Tautan Konten Live:</span>
                  {endorsement.postedUrl ? (
                    <a
                      href={endorsement.postedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400 hover:underline break-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span>{endorsement.postedUrl}</span>
                    </a>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-500">Konten belum diposting</p>
                  )}
                </div>
              </div>

              {/* Audit Trail & History Log */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  Riwayat Perubahan Tahapan (Audit Log)
                </h3>
                {filteredLogs.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    Belum ada catatan perpindahan tahapan untuk kampanye ini.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2.5 text-xs rounded-lg bg-zinc-900 p-2.5 border border-zinc-800/80"
                      >
                        <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-mono text-violet-300 uppercase">
                          {log.action}
                        </span>
                        <div className="flex-1">
                          <p className="text-zinc-200">{log.description}</p>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(log.timestamp).toLocaleString('id-ID')} • Oleh: {log.actorEmail} ({log.actorRole})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Asisten AI & Script */}
          {activeTab === 'script' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4">
                <div className="flex items-center gap-2 text-violet-300 text-xs font-bold">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  Gemini Creator Intelligence (models/gemini-2.5-flash)
                </div>
                <p className="text-xs text-zinc-300 mt-1">
                  Hasilkan ide hook viral, susun storyline 3-babak, dan periksa kepatuhan draft terhadap arahan brand.
                </p>
              </div>

              {/* USP Input for AI */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Poin Keunggulan / USP Produk yang Wajib Masuk Script:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={uspInput}
                    onChange={(e) => setUspInput(e.target.value)}
                    placeholder="Contoh: Mengandung Ceramide 5X, hasil glowing, promo diskon 30%..."
                    className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                  <button
                    onClick={handleGenerateScript}
                    disabled={isAiLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-2 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 transition-all shrink-0"
                  >
                    <Bot className="h-4 w-4" />
                    <span>{isAiLoading ? 'Menulis Script...' : 'Hasilkan Script AI'}</span>
                  </button>
                </div>
              </div>

              {/* Script Viewer & Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Naskah / Script Konten Endorsement:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(aiScriptResult, 'script')}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                    >
                      {copiedText === 'script' ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin Script</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleReviewCompliance}
                      disabled={isAiLoading || !aiScriptResult}
                      className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-violet-300 hover:bg-zinc-700 disabled:opacity-40"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
                      <span>Review Kesesuaian Brief</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={aiScriptResult}
                  disabled={!canEdit}
                  onChange={(e) => {
                    setAiScriptResult(e.target.value);
                    if (canEdit) {
                      onUpdateEndorsement({
                        ...endorsement,
                        scriptContent: e.target.value,
                      });
                    }
                  }}
                  placeholder="Klik 'Hasilkan Script AI' atau ketikkan storyline naskah di sini..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-xs text-zinc-200 focus:border-violet-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* AI Compliance Result Box */}
              {complianceResult && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Hasil Peninjauan AI Briefing</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        complianceResult.verdict === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      Skor: {complianceResult.complianceScore}/100 ({complianceResult.verdict})
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {complianceResult.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WhatsApp Chat Generator */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  Generator Pesan Koordinasi WhatsApp Otomatis
                </div>
                <p className="text-xs text-zinc-300 mt-1">
                  Format pesan chat profesional disesuaikan dengan tahapan saat ini (
                  <b>{endorsement.stage}</b>) untuk mempercepat follow-up.
                </p>
              </div>

              {/* Recipient switch & trigger button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">Tujuan Pesan:</span>
                  <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setWaRecipient('talent')}
                      className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                        waRecipient === 'talent'
                          ? 'bg-violet-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Ke Talent ({endorsement.talentName})
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaRecipient('brand')}
                      className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                        waRecipient === 'brand'
                          ? 'bg-violet-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Ke Brand ({endorsement.brandName})
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateWhatsApp}
                  disabled={isAiLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Buat Template WhatsApp AI</span>
                </button>
              </div>

              {/* Message box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Draf Pesan WhatsApp:
                  </span>
                  {waMessage && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyToClipboard(waMessage, 'whatsapp')}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                      >
                        {copiedText === 'whatsapp' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Salin Chat</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-2.5 py-1 text-[11px] font-semibold border border-emerald-500/30"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Kirim via WA</span>
                      </a>
                    </div>
                  )}
                </div>

                <textarea
                  rows={6}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder="Klik 'Buat Template WhatsApp AI' untuk membuat teks ramah siap kirim..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Insights & Pembayaran */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Metrics Form Grid */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-400" />
                    Input Analytics & Metrik Konten
                  </h3>
                  {canEdit && (
                    <button
                      onClick={handleSaveInsights}
                      className="rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1 text-xs font-semibold text-white transition-colors"
                    >
                      Simpan Insights
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400">Total Views (Tayangan):</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={editInsights.views || ''}
                      onChange={(e) =>
                        setEditInsights({ ...editInsights, views: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400">Reach (Jangkauan):</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={editInsights.reach || ''}
                      onChange={(e) =>
                        setEditInsights({ ...editInsights, reach: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400">Likes:</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={editInsights.likes || ''}
                      onChange={(e) =>
                        setEditInsights({ ...editInsights, likes: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400">Comments:</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={editInsights.comments || ''}
                      onChange={(e) =>
                        setEditInsights({ ...editInsights, comments: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-zinc-950/80 p-3 text-xs">
                  <span className="text-zinc-400">Kalkulasi Engagement Rate (ER):</span>
                  <span className="text-base font-bold text-pink-400">
                    {endorsement.insights?.engagementRate || 0}%
                  </span>
                </div>
              </div>

              {/* Gemini AI Performance Analyzer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    Analisis Efektivitas Biaya & ROI (Gemini AI)
                  </h3>
                  <button
                    onClick={handleAnalyzeInsights}
                    disabled={isAiLoading}
                    className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-zinc-700 disabled:opacity-40"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>{isAiLoading ? 'Menganalisis...' : 'Analisis Performa Sekarang'}</span>
                  </button>
                </div>

                {aiInsightAnalysis && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                    {aiInsightAnalysis}
                  </div>
                )}
              </div>

              {/* Payment Status Manager (Admin / Owner only) */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  Status Pembayaran Kontrak
                </h3>
                <div className="flex items-center gap-2">
                  {(['unpaid', 'pending', 'paid'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => {
                        if (canEdit) {
                          onUpdateEndorsement({
                            ...endorsement,
                            paymentStatus: status,
                          });
                        }
                      }}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase transition-all ${
                        endorsement.paymentStatus === status
                          ? status === 'paid'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                            : status === 'pending'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                            : 'bg-zinc-700 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 disabled:hover:bg-zinc-900'
                      }`}
                    >
                      {status === 'paid'
                        ? 'Lunas (Paid)'
                        : status === 'pending'
                        ? 'Proses (Pending)'
                        : 'Belum Bayar (Unpaid)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
