'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Coins, Plus, Calendar, ShieldCheck, AlertCircle, FileText, Share2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface TopupRequest {
  id: number;
  package_name: string;
  diamond_amount: number;
  amount: number;
  receipt_url: string;
  user_note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
}

export default function DiamondsPage() {
  const { user, token, isAuthenticated, updateUserBalance, refreshUser } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [history, setHistory] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Referral state
  const [copied, setCopied] = useState<boolean>(false);
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${user?.id || ''}` : '';

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [claiming, setClaiming] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const loadHistory = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/topup/topup-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadHistory();
    }
  }, [token]);

  const handleClaimCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !token) return;

    setClaiming(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch(`${API_URL}/user/claim-coupon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ code: couponCode })
      });

      const data = await res.json();

      if (res.ok) {
        setCouponSuccess(data.message);
        updateUserBalance(data.diamond_balance);
        refreshUser();
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Kuponni faollashtirishda xatolik yuz berdi.');
      }
    } catch (err) {
      setCouponError('Internet aloqasini tekshiring.');
    } finally {
      setClaiming(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/25';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('dashboard.statusPending');
      case 'approved': return t('dashboard.statusApproved');
      case 'rejected': return t('dashboard.statusRejected');
      default: return status;
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Submenu */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4 mb-8">
        <Link 
          href="/dashboard"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors cursor-pointer"
        >
          {t('common.profile')}
        </Link>
        <Link 
          href="/dashboard/diamonds"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400 cursor-pointer"
        >
          {t('common.wallet')}
        </Link>
        <Link 
          href="/dashboard/buy-diamonds"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors cursor-pointer"
        >
          {t('topup.title')}
        </Link>
        <Link 
          href="/dashboard/transactions"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors cursor-pointer"
        >
          {t('dashboard.recentTransactions')}
        </Link>
        <Link 
          href="/dashboard/library"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors cursor-pointer"
        >
          {t('common.library')}
        </Link>
      </div>

      <div className="space-y-8">
        {/* Wallet balance display card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-violet-950/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 shadow-xl shadow-amber-500/5 animate-pulse-glow">
              <Coins className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                {t('dashboard.balanceCardTitle')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-400 mt-1">
                {user.diamond_balance} <StrawberryIcon />
              </h2>
            </div>
          </div>

          <Link
            href="/dashboard/buy-diamonds"
            className="flex items-center gap-1.5 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>{t('dashboard.buyBtn')}</span>
          </Link>
        </div>

        {/* Actions grid (Coupon & Referral) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coupon Claim Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-violet-400" />
                {t('dashboard.couponCardTitle')}
              </h3>

              <form onSubmit={handleClaimCoupon} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-grow space-y-1.5 w-full">
                  <label className="text-xs text-slate-400 font-semibold">
                    {t('dashboard.couponCodeLabel')}
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t('dashboard.couponCodePlaceholder')}
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors uppercase font-bold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={claiming}
                  className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer h-10 flex items-center justify-center flex-shrink-0"
                >
                  {claiming ? t('common.loading') : t('dashboard.couponClaimBtn')}
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {couponError && (
                <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              {couponSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{couponSuccess}</span>
                </div>
              )}
            </div>
          </div>

          {/* Referral Link Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-violet-400" />
                {t('dashboard.referralCardTitle')}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {t('dashboard.referralCardDesc')}
              </p>
            </div>

            <div className="space-y-1.5 w-full">
              <label className="text-xs text-slate-400 font-semibold">
                {t('dashboard.referralLinkPlaceholder')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="w-full bg-slate-950 border border-white/10 text-slate-300 text-xs px-4 py-2.5 rounded-xl outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  type="button"
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('dashboard.copiedSuccess')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('dashboard.copyLinkBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Topup History logs */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-lg font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            {t('dashboard.topupHistory')}
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-900/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">{t('dashboard.packageName')}</th>
                    <th className="pb-3 px-4">{t('dashboard.packagePrice')}</th>
                    <th className="pb-3 px-4">{t('common.status')}</th>
                    <th className="pb-3 px-4">{t('common.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((req) => (
                    <React.Fragment key={req.id}>
                      <tr className="border-b border-white/5 text-slate-300 font-medium">
                        <td className="py-4 pr-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-200">{req.package_name}</span>
                            <span className="text-[10px] text-slate-400 block">+{req.diamond_amount} <StrawberryIcon /></span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-200 font-semibold">
                          {req.amount.toLocaleString()} UZS
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${getStatusBadge(req.status)}`}>
                            {getStatusText(req.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400">
                          {new Date(req.created_at).toLocaleDateString('uz-UZ')}
                        </td>
                      </tr>
                      {/* Show admin reject reason if rejected */}
                      {req.status === 'rejected' && req.admin_note && (
                        <tr className="bg-red-500/5 border-b border-white/5 text-[10px] text-red-300">
                          <td colSpan={4} className="py-2.5 px-4">
                            <span className="font-bold">{t('dashboard.rejectReason')}:</span> {req.admin_note}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Sizda to'lov arizalari hali mavjud emas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

