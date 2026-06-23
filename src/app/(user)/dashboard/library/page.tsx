'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { SeriesCard, Series } from '@/components/SeriesCard';
import { Bookmark, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const [bookmarks, setBookmarks] = useState<Series[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/bookmarks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          setBookmarks(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadBookmarks();
    }
  }, [token]);

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
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors"
        >
          {t('dashboard.recentTransactions')}
        </Link>
        <Link 
          href="/dashboard/library"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400"
        >
          {t('common.library')}
        </Link>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-violet-400" />
          {t('common.library')}
        </h3>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-900/40 rounded-xl animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {bookmarks.map((series) => (
              <SeriesCard key={series.id} series={series} hideMatureOverride={true} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-2xl border border-white/5 text-center text-slate-400 max-w-md mx-auto space-y-4">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm">Kutubxonangiz bo'sh. Sevimli manhwa va mangalaringizni katalogdan qidirib ko'ring.</p>
            <Link 
              href="/catalog" 
              className="inline-block px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Katalogni ko'rish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
