'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/context/I18nContext';
import { SeriesCard, Series } from '@/components/SeriesCard';
import { API_URL } from '@/context/AuthContext';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw, BookOpen } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
  slug: string;
}

export default function NovelsCatalogPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters
  const activeGenre = searchParams.get('genre') || '';
  const activeStatus = searchParams.get('status') || '';
  const activeSort = searchParams.get('sort') || 'popularity';
  const activePage = parseInt(searchParams.get('page') || '1');
  const activeSearch = searchParams.get('search') || '';

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Genres
  useEffect(() => {
    fetch(`${API_URL}/genres`)
      .then(res => res.json())
      .then(data => setGenres(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch Novels
  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('type', 'novel'); // Strict novel type check!
        if (activeGenre) queryParams.set('genre', activeGenre);
        if (activeStatus) queryParams.set('status', activeStatus);
        if (activeSort) queryParams.set('sort', activeSort);
        if (activeSearch) queryParams.set('search', activeSearch);
        queryParams.set('page', String(activePage));

        const res = await fetch(`${API_URL}/series?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSeriesList(data.data);
          setPagination({
            currentPage: data.current_page,
            lastPage: data.last_page,
            total: data.total
          });
        }
      } catch (err) {
        console.error('Error fetching novels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, [activeGenre, activeStatus, activeSort, activePage, activeSearch]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/novels?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/novels?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/novels');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-violet-400" />
            Uzbekcha Novellalar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {pagination.total} ta matnli novel topildi
          </p>
        </div>
        
        {(activeGenre || activeStatus || activeSearch) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs bg-slate-900 border border-white/5 text-slate-300 hover:text-white px-3 py-2 rounded-lg cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Filtrlarni tozalash
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-6 bg-slate-900/20">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-slate-200 font-bold text-sm">
              <Filter className="w-4.5 h-4.5 text-violet-400" />
              <span>Filtrlar</span>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t('catalog.statusFilter')}
              </label>
              <select
                value={activeStatus}
                onChange={(e) => updateFilters('status', e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">{t('common.all')}</option>
                <option value="ongoing">{t('catalog.statusOngoing')}</option>
                <option value="completed">{t('catalog.statusCompleted')}</option>
                <option value="paused">{t('catalog.statusPaused')}</option>
                <option value="dropped">{t('catalog.statusDropped')}</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t('catalog.sortBy')}
              </label>
              <select
                value={activeSort}
                onChange={(e) => updateFilters('sort', e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
              >
                <option value="popularity">{t('catalog.sortPopular')}</option>
                <option value="newest">{t('catalog.sortNewest')}</option>
                <option value="alphabetical">{t('catalog.sortAlpha')}</option>
              </select>
            </div>

            {/* Genre List */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t('catalog.genreFilter')}
              </label>
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => updateFilters('genre', '')}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    !activeGenre ? 'bg-violet-600/10 text-violet-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('common.all')}
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => updateFilters('genre', genre.slug)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeGenre === genre.slug ? 'bg-violet-600/10 text-violet-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Catalog List */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-900/60 rounded-2xl border border-white/5"></div>
              ))}
            </div>
          ) : seriesList.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 rounded-2xl border border-white/5 py-24">
              Ko'rsatilgan filtrlar bo'yicha hech qanday novel topilmadi.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {seriesList.map((series) => (
                <div key={series.id} className="relative">
                  <SeriesCard series={series} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 hover:text-white rounded-xl border border-white/5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs text-slate-400 font-bold px-4">
                Sahifa {pagination.currentPage} / {pagination.lastPage}
              </span>

              <button
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 hover:text-white rounded-xl border border-white/5 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
