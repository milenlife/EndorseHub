import React, { useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  DollarSign,
  FileText,
  Lightbulb,
  MessageCircle,
  Send,
  Sparkles,
  TrendingUp,
  Video,
} from 'lucide-react';
import {
  generateInfluencerScript,
  generateWhatsAppMessage,
  reviewDraftCompliance,
} from '../services/gemini';

export const GeminiStudioModal: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'wa' | 'compliance'>('script');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Script Generator inputs
  const [brand, setBrand] = useState('Wardah Beauty');
  const [campaign, setCampaign] = useState('Launching UV Shield Tone Up Sunscreen');
  const [platform, setPlatform] = useState('TikTok');
  const [usp, setUsp] = useState(
    'SPF 50 PA++++, mencerahkan seketika tanpa white cast, nyaman dipakai sehari-hari, tidak perih di mata.'
  );
  const [scriptOutput, setScriptOutput] = useState('');

  // WA Generator inputs
  const [waStage, setWaStage] = useState('Review / revisi / approval');
  const [waRecipient, setWaRecipient] = useState<'brand' | 'talent'>('brand');
  const [waOutput, setWaOutput] = useState('');

  // Compliance inputs
  const [draftText, setDraftText] = useState(
    'Hai guys! Aku nemuin sunscreen baru dari Wardah yang beneran ringan banget. No white cast sama sekali dan finishnya glowing natural! Cek keranjang kuning ya guys.'
  );
  const [briefReq, setBriefReq] = useState(
    'Wajib mention SPF 50 PA++++, tone up instan natural, tidak perih di mata, sertakan hashtag #WardahToneUp #SunscreenViral.'
  );
  const [complianceOutput, setComplianceOutput] = useState<{
    complianceScore: number;
    verdict: string;
    feedback: string;
  } | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const res = await generateInfluencerScript({
        brandName: brand,
        campaignTitle: campaign,
        platform,
        uspPoints: usp,
      });
      setScriptOutput(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWa = async () => {
    setLoading(true);
    try {
      const res = await generateWhatsAppMessage({
        stage: waStage as any,
        brandName: brand,
        campaignTitle: campaign,
        talentName: 'Clarissa',
        recipient: waRecipient,
      });
      setWaOutput(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCompliance = async () => {
    setLoading(true);
    try {
      const res = await reviewDraftCompliance(draftText, briefReq);
      setComplianceOutput(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-zinc-900 to-pink-950/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-tr from-violet-600 to-pink-600 p-2.5 text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Gemini AI Studio Endorsement
            </h1>
            <p className="text-xs text-zinc-300 mt-0.5">
              Didukung model <b>gemini-2.5-flash</b> untuk efisiensi pembuatan script, evaluasi brief, dan koordinasi WhatsApp
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="mt-6 flex gap-2 flex-wrap text-xs">
          <button
            onClick={() => setActiveSubTab('script')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all ${
              activeSubTab === 'script'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>AI Script & Viral Hook Generator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('wa')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all ${
              activeSubTab === 'wa'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>AI WhatsApp Follow-up Coordinator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('compliance')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all ${
              activeSubTab === 'compliance'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>AI Briefing Compliance Reviewer</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Script Generator */}
      {activeSubTab === 'script' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-violet-400" />
              Parameter Kampanye Endorsement
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-300">Nama Brand:</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Judul / Tema Campaign:</label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Platform:</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none cursor-pointer"
                >
                  <option value="TikTok">TikTok (Short-form video 30-60s)</option>
                  <option value="Instagram">Instagram Reels & Carousel</option>
                  <option value="YouTube">YouTube Shorts / In-depth Review</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300">
                  Key Message & USP Produk (Poin Keunggulan):
                </label>
                <textarea
                  rows={3}
                  value={usp}
                  onChange={(e) => setUsp(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-white focus:border-violet-500 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleGenerateScript}
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3 font-bold text-white shadow-lg shadow-violet-600/30 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                <Bot className="h-4 w-4" />
                <span>{loading ? 'AI Sedang Merumuskan Script...' : 'Hasilkan Script & Hook Viral'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Hasil Script Kreatif Gemini AI</h2>
              {scriptOutput && (
                <button
                  onClick={() => handleCopy(scriptOutput)}
                  className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Semua'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-200 overflow-y-auto max-h-[460px] whitespace-pre-line leading-relaxed font-sans">
              {scriptOutput || (
                <div className="py-20 text-center text-zinc-500">
                  Klik tombol <b>Hasilkan Script & Hook Viral</b> untuk membuat outline storyline otomatis.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: WhatsApp Generator */}
      {activeSubTab === 'wa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              Pengaturan Pesan WhatsApp
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-300">Pilih Tahapan (1-10):</label>
                <select
                  value={waStage}
                  onChange={(e) => setWaStage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none cursor-pointer"
                >
                  <option value="Undangan masuk">1. Undangan masuk</option>
                  <option value="Masuk grup WhatsApp">2. Masuk grup WhatsApp</option>
                  <option value="Menyiapkan script">3. Menyiapkan script</option>
                  <option value="Membuat draft konten">4. Membuat draft konten</option>
                  <option value="Mengirim draft ke grup">5. Mengirim draft ke grup</option>
                  <option value="Review / revisi / approval">6. Review / revisi / approval</option>
                  <option value="Konten diposting">7. Konten diposting</option>
                  <option value="Mengirim insights">8. Mengirim insights</option>
                  <option value="Menunggu pembayaran">9. Menunggu pembayaran</option>
                  <option value="DONE">10. DONE (Selesai)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Target Penerima:</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setWaRecipient('brand')}
                    className={`rounded-xl py-2 text-xs font-semibold ${
                      waRecipient === 'brand'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    PIC Brand
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaRecipient('talent')}
                    className={`rounded-xl py-2 text-xs font-semibold ${
                      waRecipient === 'talent'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Talent Influencer
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateWa}
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-600/30 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? 'Menyusun Pesan...' : 'Tulis Pesan WhatsApp Ramah & Lugas'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Draf Pesan WhatsApp Siap Kirim</h2>
              {waOutput && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(waOutput)}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(waOutput)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <Send className="h-3 w-3" />
                    <span>Buka WA</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-200 overflow-y-auto max-h-[460px] whitespace-pre-line leading-relaxed font-mono">
              {waOutput || (
                <div className="py-20 text-center text-zinc-500">
                  Draf chat akan muncul di sini lengkap dengan emoji dan salam khas agensi.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Compliance Reviewer */}
      {activeSubTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-pink-400" />
              Cek Kepatuhan Terhadap Brief Brand
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-300">Briefing Wajib Brand:</label>
                <textarea
                  rows={3}
                  value={briefReq}
                  onChange={(e) => setBriefReq(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Draft Naskah dari Talent:</label>
                <textarea
                  rows={4}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleCheckCompliance}
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 font-bold text-white shadow-lg shadow-pink-600/30 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                <Bot className="h-4 w-4" />
                <span>{loading ? 'AI Sedang Mengecek...' : 'Analisis Kepatuhan Draft'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 flex flex-col">
            <h2 className="text-sm font-bold text-white">Hasil Evaluasi AI Brand Manager</h2>

            <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-200 overflow-y-auto max-h-[460px] space-y-3">
              {complianceOutput ? (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="font-semibold text-zinc-400">Skor Kesesuaian:</span>
                    <span
                      className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                        complianceOutput.verdict === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {complianceOutput.complianceScore} / 100 ({complianceOutput.verdict})
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-zinc-300 block mb-1">Ulasan & Feedback:</span>
                    <p className="text-zinc-300 leading-relaxed">{complianceOutput.feedback}</p>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-zinc-500">
                  Hasil peninjauan kepatuhan terhadap briefing akan ditampilkan di sini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
