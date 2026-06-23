'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SeriesCard, Series } from '@/components/SeriesCard';
import { API_URL } from '@/context/AuthContext';
import { Search, Loader2 } from 'lucide-react';

export default function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Series[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch results when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/series?search=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center justify-center gap-2">
          <Search className="w-7 h-7 text-violet-400" />
          {t('common.search')}
        </h1>
        <p className="text-xs text-slate-400">
          Sevimli mangalaringizni nomi yoki muqobil sarlavhalari orqali izlang.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-xl mx-auto relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className="w-full bg-slate-900 border border-white/10 text-slate-200 text-sm pl-11 pr-10 py-3.5 rounded-2xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-lg shadow-black/30"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500 animate-spin" />
        )}
      </div>

      {/* Results grid */}
      <div className="max-w-5xl mx-auto pt-4">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          debouncedQuery.trim() && !loading && (
            <div className="glass-card p-12 rounded-2xl border border-white/5 text-center text-slate-400">
              <p className="text-sm">{t('common.noData')}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
