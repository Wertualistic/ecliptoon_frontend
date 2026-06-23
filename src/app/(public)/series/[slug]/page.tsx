'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { getImageUrl } from '@/components/SeriesCard';
import { MatureGateModal } from '@/components/MatureGateModal';
import { Star, MessageSquare, ListVideo, Eye, Heart, Info, Clock, Bookmark, BookmarkCheck, ArrowLeft, ArrowRight, X, UserRound, Calendar, Lock, BookOpen, AlertCircle } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface Chapter {
  id: number;
  chapter_number: number;
  title: string | null;
  is_free: boolean;
  price_in_diamonds: number;
  published_at: string;
}

interface SeriesDetails {
  id: number;
  title: string;
  slug: string;
  alternative_titles?: string; // JSON string
  description?: string;
  cover_image: string | null;
  type: 'manhwa' | 'manga' | 'manhua';
  status: 'ongoing' | 'completed' | 'paused' | 'dropped';
  is_mature: boolean;
  views_count: number;
  rating_avg: number;
  rating_count: number;
  likes_count: number;
  genres: Array<{ id: number; name: string; slug: string }>;
  sponsors?: Array<{ id: number; name: string; logo_path?: string; link_url?: string }>;
  translator?: { id: number; name: string; avatar?: string };
}

export default function SeriesDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [series, setSeries] = useState<SeriesDetails | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingAvg, setRatingAvg] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [showAgeGate, setShowAgeGate] = useState<boolean>(false);

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        const detailsRes = await fetch(`${API_URL}/series/${slug}`);
        if (!detailsRes.ok) {
          router.push('/404');
          return;
        }
        const detailsData = await detailsRes.json();
        setSeries(detailsData);

        // Load stats
        setRatingAvg(parseFloat(detailsData.rating_avg) || 0);
        setRatingCount(parseInt(detailsData.rating_count) || 0);
        setLikesCount(parseInt(detailsData.likes_count) || 0);

        // Check if mature and requires verification
        if (detailsData.is_mature) {
          const isConfirmed = localStorage.getItem('mature_confirmed') === 'true';
          const settingsAllow = localStorage.getItem('show_mature_content') === 'true';
          if (!isConfirmed && !settingsAllow) {
            setShowAgeGate(true);
          }
        }

        // Fetch Chapters
        const chaptersRes = await fetch(`${API_URL}/series/${slug}/chapters`);
        if (chaptersRes.ok) {
          setChapters(await chaptersRes.json());
        }

        // Check bookmark, like, and rating status if logged in
        if (isAuthenticated && token) {
          const bookmarksRes = await fetch(`${API_URL}/bookmarks`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            }
          });
          if (bookmarksRes.ok) {
            const bookmarks = await bookmarksRes.json();
            const exists = bookmarks.some((b: any) => b.id === detailsData.id);
            setIsBookmarked(exists);
          }

          const statusRes = await fetch(`${API_URL}/series/${detailsData.id}/rating-like-status`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            }
          });
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setIsLiked(statusData.is_liked);
            setUserRating(statusData.user_rating);
          }
        }
      } catch (err) {
        console.error('Error fetching series data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSeriesDetails();
    }
  }, [slug, isAuthenticated, token, router]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      if (isBookmarked) {
        const res = await fetch(`${API_URL}/bookmarks/${series?.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          setIsBookmarked(false);
        }
      } else {
        const res = await fetch(`${API_URL}/bookmarks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ series_id: series?.id })
        });
        if (res.ok) {
          setIsBookmarked(true);
        }
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/series/${series?.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.is_liked);
        setLikesCount(data.likes_count);
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const handleRate = async (ratingVal: number) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/series/${series?.id}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ rating: ratingVal })
      });
      if (res.ok) {
        const data = await res.json();
        setUserRating(ratingVal);
        setRatingAvg(data.rating_avg);
        setRatingCount(data.rating_count);
      }
    } catch (err) {
      console.error('Rating submit error:', err);
    }
  };

  const handleAgeGateConfirm = () => {
    localStorage.setItem('mature_confirmed', 'true');
    setShowAgeGate(false);
  };

  const handleAgeGateCancel = () => {
    router.push('/');
  };

  const getAlternativeTitles = () => {
    if (!series?.alternative_titles) return [];
    try {
      const parsed = typeof series.alternative_titles === 'string' 
        ? JSON.parse(series.alternative_titles) 
        : series.alternative_titles;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-64 aspect-[3/4] bg-slate-900 rounded-2xl"></div>
          <div className="flex-1 space-y-4 pt-4">
            <div className="h-8 w-2/3 bg-slate-900 rounded"></div>
            <div className="h-4 w-1/3 bg-slate-900 rounded"></div>
            <div className="h-20 w-full bg-slate-900 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!series) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
      {/* Age Gate Warning */}
      <MatureGateModal
        isOpen={showAgeGate}
        onConfirm={handleAgeGateConfirm}
        onCancel={handleAgeGateCancel}
      />

      {/* Series Info Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        {/* Cover */}
        <div className="w-56 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-900 flex-shrink-0">
          <img
            src={getImageUrl(series.cover_image)}
            alt={series.title}
            className="w-full h-full object-cover"
          />
          {series.is_mature && (
            <span className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-red-500">
              18+
            </span>
          )}
        </div>

        {/* Text Info */}
        <div className="flex-grow space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            {series.title}
          </h1>

          {/* Alternative Titles */}
          {getAlternativeTitles().length > 0 && (
            <p className="text-xs text-slate-400">
              <span className="font-semibold">{t('series.alternativeTitles')}:</span>{' '}
              {getAlternativeTitles().join(', ')}
            </p>
          )}

          {/* Translator Link */}
          {series.translator && (
            <div className="pt-1 pb-2">
              <Link href={`/translators/${series.translator.id}`} className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all hover:scale-105 active:scale-95">
                <UserRound className="w-4 h-4" />
                Tarjimon: {series.translator.name}
              </Link>
            </div>
          )}

          {/* Meta Tags */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-xs">
            <span className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold rounded-md uppercase">
              {t(`catalog.type${series.type.charAt(0).toUpperCase() + series.type.slice(1)}`)}
            </span>
            
            <span className="px-2.5 py-1 bg-slate-900 border border-white/5 text-slate-300 font-semibold rounded-md">
              {getStatusText(series.status)}
            </span>

            <span className="flex items-center gap-1 text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1 rounded-md">
              <Eye className="w-4 h-4 text-violet-400" />
              {series.views_count.toLocaleString()}
            </span>

            {/* Rating Stat display */}
            <span className="flex items-center gap-1 text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-md font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {ratingAvg > 0 ? `${ratingAvg.toFixed(1)} (${ratingCount} baho)` : 'Baholanmagan'}
            </span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1">
            {series.genres.map((genre) => (
              <span
                key={genre.id}
                className="text-[11px] bg-slate-900 border border-white/5 text-slate-300 px-2.5 py-1 rounded-full hover:border-violet-500/30 transition-colors"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Action buttons (Bookmark, Like & Rating selector) */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              {/* Library Bookmark button */}
              <button
                onClick={handleBookmarkToggle}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                  isBookmarked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/10'
                }`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4.5 h-4.5" />
                    <span>{t('series.removeFromLibrary')}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4.5 h-4.5" />
                    <span>{t('series.addToLibrary')}</span>
                  </>
                )}
              </button>

              {/* Like Button */}
              <button
                onClick={handleLikeToggle}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                  isLiked
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/10'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5'
                }`}
              >
                <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-white' : 'text-red-500'}`} />
                <span>{likesCount} likes</span>
              </button>
            </div>

            {/* Interactive Rating Panel */}
            <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-slate-900/40 border border-white/5 rounded-2xl max-w-sm">
              <span className="text-xs text-slate-400 font-semibold">{t('series.ratePrompt')}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const fillStar = hoverRating ? star <= hoverRating : star <= userRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          fillStar 
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]' 
                            : 'text-slate-600 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
                {userRating > 0 && (
                  <span className="text-[10px] text-emerald-400 font-bold ml-2">Siz baholadingiz: {userRating} ★</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {series.description && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-2">
          <h3 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2">
            Tavsif (Description)
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {series.description}
          </p>
        </div>
      )}

      {/* Sponsors Section */}
      {series.sponsors && series.sponsors.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-4">
          <h3 className="text-base font-bold text-amber-400 border-b border-amber-500/20 pb-2">
            Homiylar (Sponsors)
          </h3>
          <div className="flex flex-wrap gap-4">
            {series.sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.link_url || '#'}
                target={sponsor.link_url ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 hover:bg-slate-900 border border-amber-500/30 rounded-xl transition-all hover:scale-105"
              >
                <span className="text-sm font-bold text-slate-200">{sponsor.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Chapters Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-2">
          <BookOpen className="w-5 h-5 text-violet-400" />
          {t('series.chapters')}
        </h3>

        {chapters.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => router.push(`/series/${series.slug}/${chapter.id}`)}
                className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-violet-500/30 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-violet-400 text-sm group-hover:scale-105 transition-transform">
                    {t('common.chapter')} {chapter.chapter_number}
                  </span>
                  
                  {chapter.title && (
                    <span className="text-xs text-slate-300 line-clamp-1">
                      - {chapter.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Free vs locked badge */}
                  {chapter.is_free ? (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                      {t('series.freeChapter')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>{chapter.price_in_diamonds} <StrawberryIcon /></span>
                    </span>
                  )}

                  <span className="hidden sm:inline flex items-center gap-1 text-[10px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(chapter.published_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 rounded-2xl border border-white/5 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">{t('series.noChapters')}</p>
          </div>
        )}
      </div>

    </div>
  );
}
