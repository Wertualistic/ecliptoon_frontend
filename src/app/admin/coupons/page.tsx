'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Ticket, Plus, Trash2, Calendar, Users, Percent, Gift, AlertCircle, ShieldCheck } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface Coupon {
  id: number;
  code: string;
  diamond_amount: number;
  max_uses: number;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminCouponsPage() {
  const { token } = useAuth();
  const { t } = useTranslation();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [code, setCode] = useState<string>('');
  const [diamondAmount, setDiamondAmount] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('1');
  const [expiresAt, setExpiresAt] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCoupons = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/coupons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        setCoupons(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCoupons();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !diamondAmount || !maxUses || !token) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          diamond_amount: parseInt(diamondAmount),
          max_uses: parseInt(maxUses),
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Kupon muvaffaqiyatli yaratildi!'); // "Coupon successfully created!"
        setCode('');
        setDiamondAmount('');
        setMaxUses('1');
        setExpiresAt('');
        loadCoupons();
      } else {
        setError(data.message || 'Kuponni saqlashda xatolik yuz berdi.');
      }
    } catch (err) {
      setError('Internet aloqasini tekshiring.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Ushbu kuponni o\'chirishni xohlaysizmi?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (res.ok) {
        setSuccess('Kupon o\'chirildi.');
        loadCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isExpired = (expires: string | null) => {
    if (!expires) return false;
    return new Date(expires).getTime() < new Date().getTime();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Ticket className="w-6.5 h-6.5 text-violet-400" />
            <span>Kuponlar boshqaruvi (Coupon Codes)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Foydalanuvchilarga bepul olmos taqdim etish uchun maxsus promo-kodlar yaratish
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Create Form */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-2">
            <Plus className="w-4.5 h-4.5 text-violet-400" />
            <span>{t('adminPanel.addCoupon')}</span>
          </h3>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Kupon kodi (Unique Code)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="masalan: OLMOSTEZ50"
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors uppercase font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Olmos miqdori (Diamonds to Credit)
              </label>
              <input
                type="number"
                min={1}
                value={diamondAmount}
                onChange={(e) => setDiamondAmount(e.target.value)}
                placeholder="masalan: 50"
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Maksimal foydalanish soni (Total Max Claims)
              </label>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="100"
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Amal qilish muddati (Expires At - Ixtiyoriy)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? t('common.loading') : 'Yaratish'}</span>
              <Gift className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Coupon list */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2">
            Kuponlar ro'yxati
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-900/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : coupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Kod</th>
                    <th className="pb-3 px-4">Olmos</th>
                    <th className="pb-3 px-4">Foydalanish (Claims)</th>
                    <th className="pb-3 px-4">Muddati</th>
                    <th className="pb-3 px-4">Holati</th>
                    <th className="pb-3 px-4 text-center">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => {
                    const expired = isExpired(c.expires_at);
                    const fullyUsed = c.uses_count >= c.max_uses;
                    const active = c.is_active && !expired && !fullyUsed;

                    return (
                      <tr key={c.id} className="border-b border-white/5 text-slate-300">
                        <td className="py-3.5 pr-4 font-extrabold text-violet-400 select-all tracking-wider">
                          {c.code}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">
                          {c.diamond_amount} <StrawberryIcon />
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {c.uses_count} / <span className="text-slate-500">{c.max_uses}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {c.expires_at ? new Date(c.expires_at).toLocaleDateString('uz-UZ') : 'Cheksiz'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                            active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : 'bg-red-500/10 text-red-400 border-red-500/25'
                          }`}>
                            {active ? 'Faol' : expired ? 'Muddati tugagan' : 'Tugagan'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Hali hech qanday kupon yaratilmagan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

