'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Coins, CreditCard, Upload, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface Package {
  id: number;
  name: string;
  diamond_amount: number;
  price: number;
  currency: string;
}

interface PaymentCard {
  id: number;
  card_number: string;
  card_holder_name: string;
  bank_name: string;
}

export default function BuyDiamondsPage() {
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const [packages, setPackages] = useState<Package[]>([]);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  
  const [receipt, setReceipt] = useState<File | null>(null);
  const [note, setNote] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const loadWalletData = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/user/wallet`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPackages(data.packages || []);
          setCards(data.payment_methods || []);
          if (data.packages && data.packages.length > 0) {
            setSelectedPkg(data.packages[0]); // default select first
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadWalletData();
    }
  }, [token]);

  const handleCopyCard = (cardNumber: string, id: number) => {
    navigator.clipboard.writeText(cardNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Kvitansiya rasmi hajmi 5MB dan oshmasligi kerak.');
      setReceipt(null);
      return;
    }

    setError(null);
    setReceipt(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) {
      setError('Iltimos, olmos paketini tanlang.');
      return;
    }
    if (!receipt) {
      setError('Iltimos, to\'lov kvitansiyasini (screenshot) yuklang.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('package_id', String(selectedPkg.id));
      formData.append('receipt_image', receipt);
      if (note) {
        formData.append('user_note', note);
      }

      const res = await fetch(`${API_URL}/topup/topup-requests`, {
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
        setNote('');
      } else {
        setError(data.message || 'Ariza yuborishda xatolik yuz berdi.');
      }
    } catch (err) {
      setError('Serverga ulanishda xatolik. Tarmoqni tekshiring.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Submenu */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4 mb-8">
        <Link 
          href="/dashboard"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors"
        >
          {t('common.profile')}
        </Link>
        <Link 
          href="/dashboard/diamonds"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors"
        >
          {t('common.wallet')}
        </Link>
        <Link 
          href="/dashboard/buy-diamonds"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400"
        >
          {t('topup.title')}
        </Link>
        <Link 
          href="/dashboard/transactions"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors"
        >
          {t('dashboard.recentTransactions')}
        </Link>
        <Link 
          href="/dashboard/library"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors"
        >
          {t('common.library')}
        </Link>
      </div>

      {success ? (
        /* Success Screen */
        <div className="glass-card p-8 rounded-2xl border border-white/5 text-center space-y-6 max-w-lg mx-auto">
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500">
              <CheckCircle2 className="w-16 h-16" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100">{t('topup.success').split('.')[0]}!</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('topup.success')}
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/dashboard/diamonds" 
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm text-center shadow-md shadow-violet-500/10"
            >
              Hamyon sahifasiga o'tish
            </Link>
            <button 
              onClick={() => setSuccess(false)}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 rounded-xl font-bold text-sm cursor-pointer"
            >
              Yana sotib olish
            </button>
          </div>
        </div>
      ) : (
        /* Buy Diamonds Form Flow */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Package Selection & Cards */}
          <div className="space-y-6">
            {/* Package Cards List */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Coins className="w-4.5 h-4.5 text-violet-400" />
                {t('topup.selectPackage')}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    className={`p-4 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${
                      selectedPkg?.id === pkg.id
                        ? 'bg-violet-500/10 border-violet-500 text-slate-100 shadow-md shadow-violet-500/5'
                        : 'bg-slate-900/30 border-white/5 text-slate-300 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-400 text-sm">{pkg.diamond_amount} <StrawberryIcon /></span>
                      <span className="text-xs text-slate-400">({pkg.name})</span>
                    </div>
                    
                    <span className="font-bold text-sm text-slate-200">
                      {pkg.price.toLocaleString()} UZS
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Card numbers */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <CreditCard className="w-4.5 h-4.5 text-violet-400" />
                {t('topup.cardDetails')}
              </h3>

              <p className="text-[10px] text-slate-400">
                {t('topup.instructions')}
              </p>

              <div className="space-y-3">
                {cards.map((card) => (
                  <div key={card.id} className="p-4 bg-slate-950/70 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span className="font-bold text-violet-400">{card.bank_name}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCard(card.card_number, card.id)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
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
                      {t('topup.cardHolder')} <span className="font-semibold text-slate-400">{card.card_holder_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Receipt Upload */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Upload className="w-4.5 h-4.5 text-violet-400" />
              {t('topup.uploadReceipt')}
            </h3>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Selector info */}
            {selectedPkg && (
              <div className="bg-violet-500/5 border border-violet-500/10 p-4 rounded-xl flex justify-between items-center text-xs">
                <span className="text-slate-400">Kutilayotgan to'lov:</span>
                <span className="font-bold text-violet-400">
                  {selectedPkg.price.toLocaleString()} UZS (+{selectedPkg.diamond_amount} <StrawberryIcon />)
                </span>
              </div>
            )}

            {/* Drag & Drop Upload field */}
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-2xl p-6 transition-all text-center bg-slate-950/40">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-2">
                  <div className="mx-auto p-3 bg-slate-900 border border-white/5 rounded-full w-12 h-12 flex items-center justify-center text-slate-400">
                    <Upload className="w-5 h-5 text-violet-400" />
                  </div>
                  
                  {receipt ? (
                    <div>
                      <p className="text-sm font-semibold text-emerald-400 line-clamp-1">{receipt.name}</p>
                      <p className="text-[10px] text-slate-500">{(receipt.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-300">Rasm yuklash uchun bosing</p>
                      <p className="text-[10px] text-slate-500 mt-1">{t('topup.fileLimits')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Note text field */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                {t('topup.noteLabel')}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('topup.notePlaceholder')}
                rows={3}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting || !receipt}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
            >
              {submitting ? t('common.loading') : (
                <>
                  <span>{t('topup.submitBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

