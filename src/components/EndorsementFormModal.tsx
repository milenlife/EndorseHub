import React, { useEffect, useState } from 'react';
import { DollarSign, FileText, Plus, Sparkles, User, X } from 'lucide-react';
import { Endorsement, StageName } from '../types/endorsement';
import { STAGES } from '../utils/endorsementLogic';

interface EndorsementFormModalProps {
  initialData?: Endorsement | null;
  currentUser?: { displayName?: string; email?: string; role?: string };
  onClose: () => void;
  onSubmit: (data: Partial<Endorsement>) => void;
}

export const EndorsementFormModal: React.FC<EndorsementFormModalProps> = ({
  initialData,
  currentUser,
  onClose,
  onSubmit,
}) => {
  const isTalent = currentUser?.role === 'talent';
  const defaultTalentName = isTalent
    ? currentUser?.displayName || 'Talent'
    : initialData?.talentName || '';
  const defaultTalentEmail = isTalent
    ? currentUser?.email || ''
    : initialData?.talentEmail || '';

  const [brandName, setBrandName] = useState(initialData?.brandName || '');
  const [campaignTitle, setCampaignTitle] = useState(initialData?.campaignTitle || '');
  const [talentName, setTalentName] = useState(defaultTalentName);
  const [talentEmail, setTalentEmail] = useState(defaultTalentEmail);
  const [platform, setPlatform] = useState<Endorsement['platform']>(
    initialData?.platform || 'Instagram'
  );
  const [fee, setFee] = useState<number>(initialData?.fee !== undefined ? initialData.fee : 50000);
  const [stage, setStage] = useState<StageName>(initialData?.stage || 'Undangan masuk');
  const [deadline, setDeadline] = useState(
    initialData?.deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [whatsAppGroupLink, setWhatsAppGroupLink] = useState(initialData?.whatsAppGroupLink || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [draftUrl, setDraftUrl] = useState(initialData?.draftUrl || '');
  const [postedUrl, setPostedUrl] = useState(initialData?.postedUrl || '');
  const [paymentStatus, setPaymentStatus] = useState<Endorsement['paymentStatus']>(
    initialData?.paymentStatus || 'unpaid'
  );

  // Lock background body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !campaignTitle.trim()) {
      alert('Nama Brand dan Judul Campaign wajib diisi.');
      return;
    }

    if (Number(fee) < 50000) {
      alert('Nilai kontrak / fee minimal adalah Rp 50.000');
      return;
    }

    const stageIdx = STAGES.findIndex((s) => s.name === stage);

    onSubmit({
      brandName: brandName.trim(),
      campaignTitle: campaignTitle.trim(),
      talentName: talentName.trim() || 'Talent',
      talentEmail: talentEmail.trim() || 'talent@creator.id',
      platform,
      fee: Number(fee) || 50000,
      stage,
      stageIndex: stageIdx >= 0 ? stageIdx : 0,
      deadline,
      whatsAppGroupLink: whatsAppGroupLink.trim(),
      notes: notes.trim(),
      draftUrl: draftUrl.trim(),
      postedUrl: postedUrl.trim(),
      paymentStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-hidden">
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl overflow-y-auto overscroll-contain touch-pan-y max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {initialData ? 'Edit Data Endorsement' : 'Tambah Endorsement Baru'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Kelola informasi brand, talent, rate card, dan tahapan kampanye
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Brand & Campaign */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-zinc-300">Nama Brand *</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Contoh: Skintific, Samsung, Somethinc"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-300">Judul Campaign *</label>
              <input
                type="text"
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="Contoh: Launching Serum Barrier 2026"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Talent Name & Talent Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-zinc-300">Nama Talent (Influencer) *</label>
              <input
                type="text"
                required
                value={talentName}
                onChange={(e) => setTalentName(e.target.value)}
                placeholder="Nama Influencer"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-300">Email Talent *</label>
              <input
                type="email"
                required
                disabled={isTalent}
                value={talentEmail}
                onChange={(e) => setTalentEmail(e.target.value)}
                placeholder="email@creator.id"
                className={`mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none ${
                  isTalent ? 'opacity-80 cursor-not-allowed bg-zinc-950 text-zinc-400' : ''
                }`}
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {isTalent
                  ? 'Terkunci pada email akun Anda sendiri'
                  : 'Digunakan untuk hak akses role Talent melihat proyek ini'}
              </span>
            </div>
          </div>

          {/* Platform, Fee & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-zinc-300">Platform Utama</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none cursor-pointer"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitter/X">Twitter/X</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-300">Nilai Kontrak / Fee (IDR)</label>
                <span className="text-[10px] text-violet-400 font-medium">Min. 50.000</span>
              </div>
              <input
                type="number"
                min="50000"
                step="10000"
                required
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white font-mono focus:border-violet-500 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(fee || 0)}
              </span>
            </div>

            <div>
              <label className="font-semibold text-zinc-300">Tenggat Waktu (Deadline)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Stage selector (10 stages) & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-zinc-300">Tahapan Progres (1-10 Tahap)</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as StageName)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none cursor-pointer"
              >
                {STAGES.map((s, idx) => (
                  <option key={s.name} value={s.name}>
                    {idx + 1}. {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-300">Status Pembayaran</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none cursor-pointer"
              >
                <option value="unpaid">Belum Dibayar (Unpaid)</option>
                <option value="pending">Proses / Termin (Pending)</option>
                <option value="paid">Lunas (Paid)</option>
              </select>
            </div>
          </div>

          {/* WhatsApp Group Link */}
          <div>
            <label className="font-semibold text-zinc-300">Link Grup WhatsApp (Opsional)</label>
            <input
              type="url"
              value={whatsAppGroupLink}
              onChange={(e) => setWhatsAppGroupLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Notes / Briefing */}
          <div>
            <label className="font-semibold text-zinc-300">Catatan Briefing & Arahan Brand</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ketentuan konten, do's & don'ts, link swipe up, hashtag wajib..."
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-300 hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-violet-600/30 hover:opacity-95"
            >
              {initialData ? 'Perbarui Endorsement' : 'Simpan Endorsement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
