'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { Eye, BookOpen, AlertOctagon } from 'lucide-react';

export interface Series {
  id: number;
  title: string;
  slug: string;
  alternative_titles?: string | string[];
  description?: string;
  cover_image: string | null;
  type?: string;
  status: 'ongoing' | 'completed' | 'paused' | 'dropped';
  is_mature: boolean;
  is_pinned: boolean;
  is_slider?: boolean;
  views_count: number;
}

interface SeriesCardProps {
  series: Series;
  hideMatureOverride?: boolean; // force hide 18+ check if allowed globally
}

export function getImageUrl(path: string | null): string {
  if (!path) return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80'; // fallback manga cover
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://api.ecliptoon.uz';
  return `${base}/storage/${path}`;
}

export function SeriesCard({ series, hideMatureOverride = false }: SeriesCardProps) {
  const { t } = useTranslation();

  // Color code tags based on series type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manhwa': return 'from-purple-500/20 to-purple-600/30 border-purple-500/30 text-purple-300';
      case 'manga': return 'from-teal-500/20 to-teal-600/30 border-teal-500/30 text-teal-300';
      case 'manhua': return 'from-rose-500/20 to-rose-600/30 border-rose-500/30 text-rose-300';
      default: return 'from-slate-500/20 to-slate-600/30 border-slate-500/30 text-slate-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return t('catalog.statusOngoing');
      case 'completed': return t('catalog.statusCompleted');
      case 'paused': return t('catalog.statusPaused');
      case 'dropped': return t('catalog.statusDropped');
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  // Determine if we should show mature warnings
  const showMatureBlur = series.is_mature && !hideMatureOverride;

  return (
    <Link
      href={series.type === 'novel' ? `/novels/${series.slug}` : `/series/${series.slug}`}
      className="group flex flex-col glass-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
        <img
          src={getImageUrl(series.cover_image)}
          alt={series.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            showMatureBlur ? 'blur-xl scale-110 saturate-50' : ''
          }`}
          loading="lazy"
        />

        {/* Mature content warning tag */}
        {series.is_mature && (
          <span className="absolute top-2.5 right-2.5 bg-red-600/90 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-red-500 shadow-md z-10">
            18+
          </span>
        )}

        {/* Mature Blur overlay */}
        {showMatureBlur && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 text-center z-10">
            <AlertOctagon className="w-8 h-8 text-red-500 mb-1.5 animate-pulse-glow" />
            <span className="text-[10px] text-red-200 font-extrabold tracking-widest uppercase">
              Kattalar uchun
            </span>
          </div>
        )}

        {/* Type badge */}
        {(() => {
          const typeStr = series.type || 'novel';
          return (
            <span
              className={`absolute bottom-2.5 left-2.5 bg-gradient-to-br px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border ${getTypeColor(
                typeStr
              )}`}
            >
              {t(`catalog.type${typeStr.charAt(0).toUpperCase() + typeStr.slice(1)}`)}
            </span>
          );
        })()}
      </div>

      {/* Details info */}
      <div className="p-3.5 flex-grow flex flex-col justify-between gap-2">
        <div>
          {/* Title */}
          <h3 className="font-semibold text-sm line-clamp-2 text-slate-100 group-hover:text-violet-400 transition-colors">
            {series.title}
          </h3>
        </div>

        {/* Status and Views */}
        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
          <span className={`px-1.5 py-0.5 rounded border ${getStatusColor(series.status)}`}>
            {getStatusText(series.status)}
          </span>
          
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{series.views_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
