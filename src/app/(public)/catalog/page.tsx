'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/context/I18nContext';
import { SeriesCard, Series } from '@/components/SeriesCard';
import { API_URL } from '@/context/AuthContext';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
  slug: string;
}

function CatalogContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load filter values from URL params or set defaults
  const activeGenre = searchParams.get('genre') || '';
  const activeStatus = searchParams.get('status') || '';
  const activeType = searchParams.get('type') || '';
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

  // Fetch Series based on URL params
  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeGenre) queryParams.set('genre', activeGenre);
        if (activeStatus) queryParams.set('status', activeStatus);
        if (activeType) queryParams.set('type', activeType);
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
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [activeGenre, activeStatus, activeType, activeSort, activePage, activeSearch]);

  // Handler to update URL params
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to page 1 on filter change
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/catalog?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/catalog');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-7 h-7 text-violet-400" />
            {t('common.catalog')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {pagination.total} ta serial topildi
          </p>
        </div>
        
        {/* Clear filters button */}
        {(activeGenre || activeStatus || activeType || activeSearch) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs bg-slate-900 border border-white/5 text-slate-300 hover:text-white px-3 py-2 rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Filtrlarni tozalash
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 1. Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-slate-200 font-bold text-sm">
              <Filter className="w-4.5 h-4.5 text-violet-400" />
              <span>{t('catalog.filters')}</span>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t('catalog.typeFilter')}
              </label>
              <select
                value={activeType}
                onChange={(e) => updateFilters('type', e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">{t('common.all')}</option>
                <option value="manhwa">{t('catalog.typeManhwa')}</option>
                <option value="manga">{t('catalog.typeManga')}</option>
                <option value="manhua">{t('catalog.typeManhua')}</option>
              </select>
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

            {/* Sort Filter */}
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

            {/* Genres list checkboxes / filter */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t('catalog.genreFilter')}
              </label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => updateFilters('genre', '')}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeGenre === '' ? 'bg-violet-500/10 text-violet-400 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {t('common.all')}
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => updateFilters('genre', genre.slug)}
                    className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeGenre === genre.slug ? 'bg-violet-500/10 text-violet-400 font-bold border-l-2 border-violet-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 2. Catalog Grid */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-slate-900/40 rounded-xl animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : seriesList.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {seriesList.map((series) => (
                  <SeriesCard key={series.id} series={series} />
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.lastPage > 1 && (
                <div className="flex items-center justify-center space-x-2 border-t border-white/5 pt-8">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-sm text-slate-400 font-semibold px-4">
                    {pagination.currentPage} / {pagination.lastPage}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                    className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-12 rounded-2xl border border-white/5 text-center text-slate-400">
              <SlidersHorizontal className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm">{t('common.noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
