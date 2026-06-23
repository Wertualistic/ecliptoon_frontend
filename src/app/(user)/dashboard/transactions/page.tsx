'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Landmark, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface Transaction {
  id: number;
  type: 'topup' | 'purchase' | 'refund' | 'admin_adjustment';
  amount: number;
  balance_after: number;
  created_at: string;
}

export default function TransactionsPage() {
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/user/transactions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          setTransactions(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadTransactions();
    }
  }, [token]);

  const getTxTypeLabel = (type: string) => {
    switch (type) {
      case 'topup': return t('dashboard.txTopup');
      case 'purchase': return t('dashboard.txPurchase');
      case 'refund': return t('dashboard.txRefund');
      case 'admin_adjustment': return t('dashboard.txAdjustment');
      default: return type;
    }
  };

  const getTxTypeBadge = (type: string, amount: number) => {
    if (amount > 0) {
      return {
        icon: <ArrowUpRight className="w-4 h-4 text-emerald-400" />,
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        sign: '+'
      };
    } else {
      return {
        icon: <ArrowDownLeft className="w-4 h-4 text-rose-400" />,
        bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        sign: ''
      };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors"
        >
          {t('topup.title')}
        </Link>
        <Link 
          href="/dashboard/transactions"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400"
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

      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
        <h3 className="text-lg font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-violet-400" />
          {t('dashboard.recentTransactions')}
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-900/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">{t('dashboard.txType')}</th>
                  <th className="pb-3 px-4">{t('dashboard.txAmount')}</th>
                  <th className="pb-3 px-4">{t('dashboard.txBalance')}</th>
                  <th className="pb-3 px-4">{t('dashboard.txDate')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const badge = getTxTypeBadge(tx.type, tx.amount);
                  return (
                    <tr key={tx.id} className="border-b border-white/5 text-slate-300 font-medium">
                      <td className="py-4 pr-4 flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg border ${badge.bg}`}>
                          {badge.icon}
                        </div>
                        <span className="font-bold text-slate-200">{getTxTypeLabel(tx.type)}</span>
                      </td>
                      <td className={`py-4 px-4 font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {badge.sign}{tx.amount} <StrawberryIcon />
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {tx.balance_after} <StrawberryIcon />
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(tx.created_at).toLocaleString('uz-UZ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">
            Olmos amallari tarixi hali mavjud emas.
          </div>
        )}
      </div>
    </div>
  );
}

