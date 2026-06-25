'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { SeriesCard, Series, getImageUrl } from '@/components/SeriesCard';
import { API_URL } from '@/context/AuthContext';
import { TrendingUp, Sparkles, CheckCircle2, ChevronRight, Eye, ChevronLeft, Handshake } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';
import YandexAd from '@/components/YandexAd';
import AdSenseAd from '@/components/AdSenseAd';

interface LatestChapter {
  id: number;
  chapter_number: number;
  title: string | null;
  is_free: boolean;
  published_at: string;
  series: Series;
}

interface Sponsor {
  id: number;
  name: string;
  logo_url: string;
  link_url: string | null;
}

export default function HomePage() {
  const { t } = useTranslation();
  const [trending, setTrending] = useState<Series[]>([]);
  const [latest, setLatest] = useState<LatestChapter[]>([]);
  const [completed, setCompleted] = useState<Series[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [featuredList, setFeaturedList] = useState<Series[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, latestRes, completedRes, sponsorsRes, sliderRes] = await Promise.all([
          fetch(`${API_URL}/trending`),
          fetch(`${API_URL}/latest-updates`),
          fetch(`${API_URL}/completed`),
          fetch(`${API_URL}/sponsors`),
          fetch(`${API_URL}/slider`)
        ]);

        if (trendingRes.ok) {
          const trendingData = await trendingRes.json();
          setTrending(trendingData);
        }
        if (sliderRes.ok) {
          setFeaturedList(await sliderRes.json());
        }
        if (latestRes.ok) {
          setLatest(await latestRes.json());
        }
        if (completedRes.ok) {
          setCompleted(await completedRes.json());
        }
        if (sponsorsRes.ok) {
          const spData = await sponsorsRes.json();
          if (spData && spData.length > 0) {
            setSponsors(spData);
          }
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setSponsors((prev) => {
          if (prev.length === 0) {
            return [
              { id: 1, name: 'Vercel', logo_url: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png', link_url: '#' },
              { id: 2, name: 'Next.js', logo_url: 'https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png', link_url: '#' },
              { id: 3, name: 'Tailwind CSS', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg', link_url: '#' },
              { id: 4, name: 'React', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg', link_url: '#' },
              { id: 5, name: 'TypeScript', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg', link_url: '#' },
              { id: 6, name: 'Stripe', logo_url: 'https://images.ctfassets.net/fzn2n1nzq965/1uE3uP9H4yEq220BwZ4d8H/9e6717a6d88f6b69b6db9ec227f29bb5/stripe.svg', link_url: '#' },
            ];
          }
          return prev;
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-slide Hero banner every 6 seconds
  useEffect(() => {
    if (featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredList]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredList.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-64 sm:h-96 rounded-2xl bg-slate-900/50 border border-white/5"></div>
        {/* Row skeletons */}
        <div className="space-y-4">
          <div className="h-6 w-48 bg-slate-900/55 rounded"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-900/40 rounded-xl border border-white/5"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* 1. Hero Featured Banner Slider */}
      {featuredList.length > 0 && (
        <div className="relative overflow-hidden group">
          {/* Active slide view */}
          {featuredList.map((featured, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={featured.id}
                className={`transition-all duration-700 ease-in-out ${
                  isActive ? 'opacity-100 relative z-20 block' : 'opacity-0 absolute inset-0 z-0 hidden'
                }`}
              >
                {/* Background glow blur */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-15 scale-105 transition-all duration-700"
                  style={{ backgroundImage: `url(${getImageUrl(featured.cover_image)})` }}
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent z-10" />

                {/* Desktop Version */}
                <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:py-20 relative z-20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Cover Art */}
                    <div className="hidden md:block max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/5 group/cover">
                      <img
                        src={getImageUrl(featured.cover_image)}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Text Info */}
                    <div className="md:col-span-2 space-y-4 animate-scale-up">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold rounded-full uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Ommabop Seriya #{index + 1}
                      </span>
                      
                      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
                        {featured.title}
                      </h1>

                      <p className="text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-2xl">
                        {featured.description || 'Ushbu manhwa haqida batafsil ma\'lumot hali kiritilmagan.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <Link
                          href={`/series/${featured.slug}`}
                          className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-slate-50 px-6 py-3 rounded-lg text-sm font-semibold shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          O'qishni boshlash
                        </Link>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 border border-white/5 px-3 py-2 rounded-lg">
                          <Eye className="w-4 h-4 text-violet-400" />
                          <span>{featured.views_count.toLocaleString()} ko'rishlar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Version (responsive slider card matching screenshot) */}
                <div className="block md:hidden px-6 pt-4 pb-8 relative z-20">
                  <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    {/* Cover image as background of card */}
                    <img
                      src={getImageUrl(featured.cover_image)}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between">
                      {/* Top tags */}
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-violet-600/90 text-white text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                          New
                        </span>
                        <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-sm text-slate-300 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                          {featured.type.toUpperCase()}
                        </span>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="space-y-1.5">
                        <Link href={`/series/${featured.slug}`}>
                          <h2 className="text-xl font-bold text-white tracking-tight leading-tight hover:text-violet-400 transition-colors">
                            {featured.title}
                          </h2>
                        </Link>

                        {/* Status Label matching "ONGOING" status with green dot */}
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${featured.status === 'ongoing' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            {featured.status === 'ongoing' ? 'ONGOING' : 'COMPLETED'}
                          </span>
                        </div>

                        {/* Description snippet */}
                        <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                          {featured.description || 'Ushbu asar haqida batafsil ma\'lumot hali kiritilmagan.'}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Left & Right navigation arrows overlay inside the card */}
                    <button
                      onClick={handlePrevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-slate-950/65 border border-white/10 text-slate-300 rounded-full cursor-pointer hover:bg-slate-900 active:scale-95 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-slate-950/65 border border-white/10 text-slate-300 rounded-full cursor-pointer hover:bg-slate-900 active:scale-95 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Slider navigation buttons */}
          {featuredList.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-slate-950/40 border border-white/5 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 transition-colors opacity-0 group-hover:opacity-100 duration-300 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-slate-950/40 border border-white/5 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 transition-colors opacity-0 group-hover:opacity-100 duration-300 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Slider dot indicators */}
          {featuredList.length > 1 && (
            <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-30 gap-2">
              {featuredList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide ? 'bg-violet-500 w-5' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Containers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Sponsors Slider (Moved to top) */}
        {sponsors.length > 0 && (
          <section className="space-y-6 pt-4 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold flex items-center justify-center gap-2 text-slate-200">
                <Handshake className="w-5 h-5 text-violet-400" />
                <span>Bizning hamkorlarimiz (Sponsors)</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Platformamiz rivojiga hissa qo'shayotgan hamkorlar</p>
            </div>

            <div className="relative overflow-hidden w-full py-4 bg-slate-900/10 border border-white/5 rounded-2xl">
              {/* Infinite marquee row */}
              <div className="flex gap-8 items-center px-4 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
                {/* Render the list twice to create a seamless infinite scrolling loop */}
                {[...sponsors, ...sponsors].map((sp, idx) => (
                  <a
                    key={`${sp.id}-${idx}`}
                    href={sp.link_url || '#'}
                    target={sp.link_url ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="inline-flex flex-col items-center justify-center p-3 bg-slate-950/40 border border-white/5 hover:border-violet-500/30 rounded-xl hover:scale-105 transition-all w-36 h-20 text-center flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={sp.logo_url}
                      alt={sp.name}
                      className="max-w-[100px] max-h-[35px] object-contain filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold truncate max-w-full mt-1.5">{sp.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2. Trending Section */}
        {trending.length > 0 && (
          <section className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-violet-400 animate-pulse" />
                {t('home.trending')}
              </h2>
              <Link
                href="/catalog?sort=popularity"
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
              >
                <span>{t('home.viewAll')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {trending.map((series) => (
                <div key={series.id} className="hover:scale-[1.03] transition-all duration-300">
                  <SeriesCard series={series} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Yandex RTB Ad Unit */}
        <YandexAd blockId="R-A-19493146-1" renderTo="yandex_rtb_R-A-19493146-1_home" />

        {/* 3. Latest Chapters Section */}
        {latest.length > 0 && (
          <section className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-400" />
                {t('home.latestUpdates')}
              </h2>
              <Link
                href="/catalog?sort=newest"
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
              >
                <span>{t('home.viewAll')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latest.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className="flex gap-4 p-3 glass-card rounded-xl border border-white/5 items-center hover:border-violet-500/20 transition-all hover:scale-[1.01] duration-300"
                >
                  <Link 
                    href={`/series/${chapter.series.slug}`}
                    className="w-16 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-white/5"
                  >
                    <img
                      src={getImageUrl(chapter.series.cover_image)}
                      alt={chapter.series.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-grow min-w-0 space-y-1">
                    <Link 
                      href={`/series/${chapter.series.slug}`}
                      className="font-bold text-sm text-slate-100 hover:text-violet-400 transition-colors line-clamp-1"
                    >
                      {chapter.series.title}
                    </Link>
                    
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/series/${chapter.series.slug}/${chapter.id}`}
                        className="text-xs font-semibold text-violet-300 hover:text-violet-200 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/10"
                      >
                        {t('common.chapter')} {chapter.chapter_number}
                      </Link>
                      
                      {chapter.is_free ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold uppercase border border-emerald-500/10">
                          {t('series.freeChapter')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold uppercase border border-amber-500/10">
                          PRO <StrawberryIcon />
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500">
                      {new Date(chapter.published_at).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Completed Series Section */}
        {completed.length > 0 && (
          <section className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-violet-400" />
                {t('home.completed')}
              </h2>
              <Link
                href="/catalog?status=completed"
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
              >
                <span>{t('home.viewAll')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {completed.map((series) => (
                <div key={series.id} className="hover:scale-[1.03] transition-all duration-300">
                  <SeriesCard series={series} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Google AdSense Ad Unit */}
        <AdSenseAd slot="3484743574" />

      </div>
    </div>
  );
}

