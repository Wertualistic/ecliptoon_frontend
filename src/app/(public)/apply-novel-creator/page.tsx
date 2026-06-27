'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { FileText, Coins, Copy, Check, Upload, CheckCircle2, AlertCircle, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface Card {
  id: number;
  card_number: string;
  card_holder_name: string;
  bank_name: string;
}

export default function ApplyNovelCreatorPage() {
  const { token, user, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [cards, setCards] = useState<Card[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [userNote, setUserNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState<number>(50000);

  // Status of latest application
  const [appStatus, setAppStatus] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchStatusAndCards();
  }, [token]);

  const fetchStatusAndCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cardsRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/topup/payment-methods`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch(`${API_URL}/novel-creators/application-status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (cardsRes.ok) {
        setCards(await cardsRes.json());
      }
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setAppStatus(statusData.application);
        if (statusData.monthly_fee) {
          setMonthlyFee(statusData.monthly_fee);
        }
      }
    } catch (err) {
      setError('Ma\'lumotlarni olishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCard = (cardNumber: string, id: number) => {
    navigator.clipboard.writeText(cardNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Kvitansiya rasmi hajmi 10MB dan oshmasligi kerak.');
      setReceipt(null);
      return;
    }

    setError(null);
    setReceipt(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) {
      setError('Iltimos, to\'lov kvitansiyasini (screenshot) yuklang.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('receipt_image', receipt);
      if (userNote) formData.append('user_note', userNote);

      const res = await fetch(`${API_URL}/novel-creators/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setReceipt(null);
        setUserNote('');
        fetchStatusAndCards();
      } else {
        setError(data.message || 'Ariza yuborishda xatolik yuz berdi.');
      }
    } catch (err) {
      setError('Serverga ulanishda xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="text-xl font-bold text-slate-200">Novel Creator ariza topshirish</h2>
        <p className="text-slate-400 text-sm">
          Novel creator bo'lish hamda o'z asarlaringizni joylashtirish uchun avvalo tizimga kiring.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-md"
        >
          Tizimga kirish
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">Yuklanmoqda...</p>
      </div>
    );
  }

  if (user?.role === 'novel_creator' && (!appStatus || appStatus.status === 'approved')) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500">
            <CheckCircle2 className="w-16 h-16" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Siz allaqachon Novel Creatorsiz!</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Tabriklaymiz, sizning profilingiz faol. Admin panelga o'tib o'z novellalaringizni yozishni boshlashingiz mumkin.
        </p>
        {user.novel_creator_expires_at && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-violet-400 font-semibold bg-violet-500/10 py-2 px-3 rounded-lg border border-violet-500/20">
            <Calendar className="w-4 h-4" />
            Amal qilish muddati: {new Date(user.novel_creator_expires_at).toLocaleDateString('uz-UZ')}
          </div>
        )}
        <div className="flex gap-4 pt-4">
          <Link
            href="/admin"
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm text-center shadow-md cursor-pointer"
          >
            Admin Panelga o'tish
          </Link>
          <button
            onClick={() => {
              // Reset status so user can extend their subscription if needed
              setAppStatus(null);
            }}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 rounded-xl font-bold text-sm cursor-pointer"
          >
            Muddatni uzaytirish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-100">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex justify-center items-center gap-2">
          <FileText className="w-8 h-8 text-violet-400" />
          Novel Creator Bo'lish Ariza
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Platformada novellalar yozish va joylash uchun superadminning bank kartasiga oylik to'lovni amalga oshiring va kvitansiyani yuboring.
        </p>
      </div>

      {appStatus && appStatus.status === 'pending' ? (
        /* Application is Pending Review */
        <div className="glass-card p-8 rounded-2xl border border-white/5 text-center space-y-6 max-w-lg mx-auto bg-slate-900/60">
          <div className="flex justify-center">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 animate-pulse">
              <Clock className="w-16 h-16" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100">Arizangiz ko'rib chiqilmoqda</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              To'lov kvitansiyangiz platforma ma'murlari tomonidan tekshirilmoqda. Tasdiqlangandan so'ng sizga yozuvchi roli beriladi.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Yuborilgan sana: {new Date(appStatus.created_at).toLocaleDateString('uz-UZ')}
          </div>
        </div>
      ) : (
        /* Application Form or Resubmission */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Instructions and Payment Methods */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Coins className="w-4.5 h-4.5 text-violet-400" />
                To'lov Yo'riqnomasi
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Yozuvchi (Novel Creator) bo'lish oylik obuna to'lovi: <strong className="text-emerald-400">{monthlyFee.toLocaleString()} UZS</strong>.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quyidagi bank kartalaridan biriga ko'rsatilgan summani o'tkazing va o'tkazma kvitansiyasini (screenshot) saqlab oling. Keyin uni o'ng tomondagi formaga yuklang.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">
                Administrator Bank Kartalari
              </h3>

              <div className="space-y-3">
                {cards.map((card) => (
                  <div key={card.id} className="p-4 bg-slate-950/70 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span className="font-bold text-violet-400">{card.bank_name}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCard(card.card_number, card.id)}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[10px]"
                      >
                        {copiedId === card.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Nusxalandi</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Nusxalash</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-base font-extrabold text-slate-200 tracking-wider font-mono">
                      {card.card_number.replace(/(.{4})/g, '$1 ')}
                    </div>

                    <div className="text-[10px] text-slate-500 uppercase">
                      Karta egasi: <span className="font-semibold text-slate-400">{card.card_holder_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="space-y-6">
            {appStatus && appStatus.status === 'rejected' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Sizning oldingi arizangiz rad etilgan:
                </div>
                <p className="italic text-slate-300">"{appStatus.admin_note}"</p>
                <p className="text-[10px] text-slate-400 mt-1">Iltimos, qayta to'lov qilib to'g'ri kvitansiya yuklang.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">
                Ariza topshirish
              </h3>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Receipt File */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Kvitansiya rasmi (Screenshot)</label>
                <div className="relative border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center cursor-pointer">
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  {receipt ? (
                    <span className="text-xs text-emerald-400 font-bold">{receipt.name}</span>
                  ) : (
                    <span className="text-xs text-slate-400">Rasm yuklash yoki shu yerga tashlash (PNG, JPG, WEBP)</span>
                  )}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Qo'shimcha izoh (Ixtiyoriy)</label>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors resize-none"
                  placeholder="Ismingiz, telegram profilingiz yoki asaringiz haqida qisqacha..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white rounded-xl font-bold text-sm shadow-md shadow-violet-500/10 cursor-pointer transition-colors"
              >
                {submitting ? 'Yuborilmoqda...' : 'Arizani yuborish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
