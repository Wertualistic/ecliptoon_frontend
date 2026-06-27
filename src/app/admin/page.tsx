'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { LayoutDashboard, Coins, Users, BookOpen, Clock, BarChart3, ArrowUpRight, ShieldCheck, FileText } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  // Admin stats
  today_revenue?: number;
  total_revenue: number;
  pending_requests_count?: number;
  total_users?: number;
  total_series?: number;
  top_series?: Array<{
    id: number;
    title: string;
    views_count: number;
    type: string;
  }>;

  // Creator stats
  total_novels?: number;
  total_chapters?: number;
  pending_purchases_count?: number;
  active_subscribers_count?: number;
  top_novels?: Array<{
    id: number;
    title: string;
    views_count: number;
  }>;
}

export default function AdminDashboardPage() {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isCreator = user?.role === 'novel_creator';

  useEffect(() => {
    if (!token || !user || (user.role !== 'admin' && user.role !== 'novel_creator')) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const endpoint = isCreator ? `${API_URL}/creator/stats` : `${API_URL}/admin/stats`;
        const res = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, user, isCreator]);

  if (!user || (user.role !== 'admin' && user.role !== 'novel_creator')) return null;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/60 rounded-2xl border border-white/5"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-900/60 rounded-2xl border border-white/5"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <LayoutDashboard className={`w-6.5 h-6.5 ${isCreator ? 'text-violet-400' : 'text-red-400'}`} />
          <span>{isCreator ? 'Novel Creator Analitikasi' : t('adminPanel.dashboard')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isCreator
            ? 'Sizning yozgan asarlaringiz, sotilgan boblar va obunalar bo\'yicha tushum hisoboti'
            : 'ecliptoon platformasining bugungi moliyaviy va foydalanuvchilar faolligi statistikasi'}
        </p>
      </div>

      {/* Grid Stats */}
      {isCreator ? (
        /* Novel Creator Dashboard Stats Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Jami Daromad</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-200">
                {(stats.total_revenue ?? 0).toLocaleString()} UZS
              </h3>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">Tasdiqlangan jami tushum</p>
            </div>
          </div>

          {/* Pending Purchases */}
          <Link
            href="/admin/creator-purchases"
            className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 hover:-translate-y-0.5 transition-all block group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Kutilayotgan arizalar</span>
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-amber-400 flex items-center gap-2">
                <span>{stats.pending_purchases_count ?? 0}</span>
                <ArrowUpRight className="w-5 h-5 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Ko'rib chiqilishi kutilayotgan kvitansiyalar</p>
            </div>
          </Link>

          {/* Active Subscribers */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Faol obunachilar</span>
              <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-200">
                {stats.active_subscribers_count ?? 0}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Joriy faol obunaga ega foydalanuvchilar</p>
            </div>
          </div>

          {/* Total Novels */}
          <Link
            href="/admin/novels"
            className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 hover:-translate-y-0.5 transition-all block group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Novellalar</span>
              <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-200">
                {stats.total_novels ?? 0}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">{stats.total_chapters ?? 0} ta bob yuklangan</p>
            </div>
          </Link>
        </div>
      ) : (
        /* Superadmin Dashboard Stats Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Daily Revenue */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bugungi tushum</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-200">
                {(stats.today_revenue ?? 0).toLocaleString()} UZS
              </h3>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">Bugun tasdiqlangan o'tkazmalar</p>
            </div>
          </div>

          {/* Card 2: Pending requests */}
          <Link
            href="/admin/topup-requests"
            className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 hover:-translate-y-0.5 transition-all block group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Kutilayotgan arizalar</span>
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-amber-400 flex items-center gap-2">
                <span>{stats.pending_requests_count ?? 0}</span>
                <ArrowUpRight className="w-5 h-5 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Tasdiqlanishi kerak bo'lgan kvitansiyalar</p>
            </div>
          </Link>

          {/* Card 3: Total Users */}
          <Link
            href="/admin/users"
            className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 hover:-translate-y-0.5 transition-all block group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Foydalanuvchilar</span>
              <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-200">
                {stats.total_users ?? 0}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Ro'yxatdan o'tgan jami a'zolar</p>
            </div>
          </Link>

          {/* Card 4: Total Series */}
          <Link
            href="/admin/series"
            className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 hover:-translate-y-0.5 transition-all block group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Manga / Manhualar</span>
              <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-200">
                {stats.total_series ?? 0}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Platformadagi jami seriyalar</p>
            </div>
          </Link>
        </div>
      )}

      {/* Row 2: Table & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
            <BarChart3 className={`w-5 h-5 ${isCreator ? 'text-violet-400' : 'text-red-400'}`} />
            <span>{isCreator ? 'Eng ommabop novellalaringiz' : 'Eng ko\'p o\'qilgan seriyalar'}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Sarlavha</th>
                  {!isCreator && <th className="pb-3 px-4">Turi</th>}
                  <th className="pb-3 px-4">Ko'rishlar</th>
                </tr>
              </thead>
              <tbody>
                {isCreator ? (
                  stats.top_novels?.map((item, index) => (
                    <tr key={item.id} className="border-b border-white/5 text-slate-300">
                      <td className="py-3.5 pr-4 flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-slate-800 text-[10px] font-extrabold flex items-center justify-center text-slate-400">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-200">{item.title}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-bold">
                        {item.views_count.toLocaleString()} marta
                      </td>
                    </tr>
                  ))
                ) : (
                  stats.top_series?.map((item, index) => (
                    <tr key={item.id} className="border-b border-white/5 text-slate-300">
                      <td className="py-3.5 pr-4 flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-slate-800 text-[10px] font-extrabold flex items-center justify-center text-slate-400">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-200">{item.title}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold uppercase text-violet-400">
                        {item.type}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-bold">
                        {item.views_count.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card of instructions */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 space-y-4 text-slate-300">
          <h3 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2">
            {isCreator ? 'Yozuvchi (Creator) yo\'riqnomasi' : 'Admin yo\'riqnomasi'}
          </h3>
          <p className="text-xs leading-relaxed">
            {isCreator
              ? 'Novellalardan kelib tushadigan to\'lovlar to\'g\'ridan-to\'g\'ri sizning bank kartangizga manual tarzda keladi.'
              : 'Platformaning to\'lov tizimi to\'liq **manual bank o\'tkazmalari**ga asoslangan.'}
          </p>
          <p className="text-xs leading-relaxed">
            {isCreator
              ? 'Foydalanuvchilar bob yoki obunani sotib olganda o\'tkazma kvitansiyasini yuklashadi. Mening kartalarim bo\'limida karta qo\'shganingizga ishonch hosil qiling va kvitansiyalarni diqqat bilan tekshirib tasdiqlang.'
              : 'Qabul qilingan har bir arizadagi to\'lov kvitansiyasini (screenshot) diqqat bilan solishtiring, karta raqami va tushgan pul miqdorini banking ilovangiz orqali tekshiring.'}
          </p>
          <div className={`p-3 rounded-lg text-[10px] ${isCreator ? 'bg-violet-500/5 border border-violet-500/10 text-violet-300' : 'bg-red-500/5 border border-red-500/10 text-red-300'}`}>
            ⚠️ **MUHIM**: Rad etilgan arizalar uchun rad etish sababini aniq ko'rsating, chunki foydalanuvchi buni o'z kabinetida ko'radi.
          </div>
        </div>
      </div>
    </div>
  );
}
