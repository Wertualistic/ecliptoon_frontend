'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { SeriesCard, getImageUrl } from '@/components/SeriesCard';
import { Star, MessageSquare, Eye, Heart, Bookmark, BookmarkCheck, ArrowLeft, X, Copy, Check, Upload, Clock, Sparkles, CheckCircle2, Lock, Unlock, AlertCircle, UserRound } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface Chapter {
  id: number;
  chapter_number: number;
  title: string | null;
  is_free: boolean;
  price_in_uzs: number;
  published_at: string;
}

interface NovelDetails {
  id: number;
  title: string;
  slug: string;
  alternative_titles?: string; // JSON string
  description?: string;
  cover_image: string | null;
  type: string;
  status: string;
  is_mature: boolean;
  views_count: number;
  rating_avg: number;
  rating_count: number;
  likes_count: number;
  price_1m: number | null;
  price_3m: number | null;
  price_6m: number | null;
  genres: Array<{ id: number; name: string; slug: string }>;
  translator?: { id: number; name: string; avatar?: string };
}

interface Card {
  id: number;
  card_number: string;
  card_holder_name: string;
  bank_name: string;
}

export default function NovelDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [novel, setNovel] = useState<NovelDetails | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingAvg, setRatingAvg] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [trendingItems, setTrendingItems] = useState<any[]>([]);

  // Purchase/Subscription States
  const [purchaseStatus, setPurchaseStatus] = useState({
    is_subscribed: false,
    subscription_expires_at: null as string | null,
    purchased_chapter_ids: [] as number[],
    pending_purchases: [] as any[],
  });

  // Modal payment states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [creatorCards, setCreatorCards] = useState<Card[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [purchaseType, setPurchaseType] = useState<'subscription_1m' | 'subscription_3m' | 'subscription_6m' | 'single_chapter'>('subscription_1m');
  const [targetChapter, setTargetChapter] = useState<Chapter | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      const detailsRes = await fetch(`${API_URL}/series/${slug}`);
      if (!detailsRes.ok) {
        router.push('/404');
        return;
      }
      const detailsData = await detailsRes.json();
      setNovel(detailsData);
      setRatingAvg(parseFloat(detailsData.rating_avg) || 0);
      setRatingCount(parseInt(detailsData.rating_count) || 0);
      setLikesCount(parseInt(detailsData.likes_count) || 0);

      // Fetch Chapters
      const chaptersRes = await fetch(`${API_URL}/series/${slug}/chapters`);
      if (chaptersRes.ok) {
        setChapters(await chaptersRes.json());
      }

      // Fetch Trending items for recommendation at bottom
      const trendingRes = await fetch(`${API_URL}/trending`);
      if (trendingRes.ok) {
        setTrendingItems(await trendingRes.json());
      }

      // Check user bookmark and like status
      if (isAuthenticated && token) {
        // Bookmarks
        const bookmarksRes = await fetch(`${API_URL}/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bookmarksRes.ok) {
          const bookmarks = await bookmarksRes.json();
          setIsBookmarked(bookmarks.some((b: any) => b.id === detailsData.id));
        }

        // Rating & Likes Status
        const statusRes = await fetch(`${API_URL}/novels/${detailsData.id}/rating-like-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setIsLiked(statusData.is_liked);
          setUserRating(statusData.user_rating);
        }

        // Novel purchases status
        const purchaseStatusRes = await fetch(`${API_URL}/novels/${detailsData.id}/purchase-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (purchaseStatusRes.ok) {
          setPurchaseStatus(await purchaseStatusRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchDetails();
    }
  }, [slug, isAuthenticated, token]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const url = isBookmarked ? `${API_URL}/bookmarks/${novel?.id}` : `${API_URL}/bookmarks`;
      const body = isBookmarked ? null : JSON.stringify({ novel_id: novel?.id });
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };
      if (!isBookmarked) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, { method, headers, body });
      if (res.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/novels/${novel?.id}/like`, {
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
      const res = await fetch(`${API_URL}/novels/${novel?.id}/rate`, {
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

  const handleOpenPurchase = async (type: typeof purchaseType, ch: Chapter | null = null) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setPurchaseType(type);
    setTargetChapter(ch);
    setPaymentSuccess(false);
    setPaymentError(null);
    setReceiptFile(null);
    setShowPurchaseModal(true);

    // Fetch creator payment cards
    try {
      const res = await fetch(`${API_URL}/novels/${novel?.id}/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const cards = await res.json();
        setCreatorCards(cards);
        if (cards.length > 0) {
          setSelectedCardId(String(cards[0].id));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCard = (cardNumber: string, id: number) => {
    navigator.clipboard.writeText(cardNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId) {
      setPaymentError('Iltimos, to\'lov amalga oshirilgan kartani tanlang.');
      return;
    }
    if (!receiptFile) {
      setPaymentError('Iltimos, o\'tkazma kvitansiyasini (screenshot) yuklang.');
      return;
    }

    setSubmittingPayment(true);
    setPaymentError(null);

    try {
      const formData = new FormData();
      formData.append('purchase_type', purchaseType);
      formData.append('payment_method_id', selectedCardId);
      formData.append('receipt_image', receiptFile);
      if (purchaseType === 'single_chapter' && targetChapter) {
        formData.append('chapter_id', String(targetChapter.id));
      }

      const res = await fetch(`${API_URL}/novels/${novel?.id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (res.ok) {
        setPaymentSuccess(true);
        // Refresh details & status
        fetchDetails();
      } else {
        const data = await res.json();
        setPaymentError(data.message || 'Xarid yuborishda xatolik yuz berdi.');
      }
    } catch (err) {
      setPaymentError('Server xatosi. Qayta urinib ko\'ring.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Check if a chapter is locked
  const isChapterLocked = (ch: Chapter) => {
    if (ch.is_free || ch.price_in_uzs === 0) return false;
    if (purchaseStatus.purchased_chapter_ids.includes(ch.id)) return false;
    return true;
  };

  // Check if there is a pending purchase for this chapter/subscription
  const getPendingStatus = (ch: Chapter | null) => {
    return purchaseStatus.pending_purchases.find(p => 
      ch ? (p.purchase_type === 'single_chapter' && p.chapter_id === ch.id)
         : (p.purchase_type !== 'single_chapter')
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!novel) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 space-y-12">
      {/* Novel Cover and Metadata Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="w-56 h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-900">
            <img
              src={getImageUrl(novel.cover_image)}
              alt={novel.title}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleBookmarkToggle}
            className={`w-full max-w-[224px] mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-violet-600/10 border-violet-500/20 text-violet-400'
                : 'bg-slate-900 border-white/5 text-slate-300 hover:border-white/10 hover:bg-slate-800'
            }`}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-4.5 h-4.5" />
                Saqlab qo'yilgan
              </>
            ) : (
              <>
                <Bookmark className="w-4.5 h-4.5" />
                Kutubxonaga qo'shish
              </>
            )}
          </button>
        </div>

        {/* Info detail columns */}
        <div className="md:col-span-3 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-violet-600/20 border border-violet-500/20 text-violet-400 px-2.5 py-0.5 rounded font-extrabold uppercase">
                Novel
              </span>
              <span className={`px-2.5 py-0.5 rounded border text-slate-300 font-bold ${
                novel.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-900 border-white/5'
              }`}>
                {novel.status === 'ongoing' ? 'Davom etmoqda' : 'Tugallangan'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{novel.title}</h1>
            
            {novel.translator && (
              <div className="pt-1 pb-1">
                <Link href={`/translators/${novel.translator.id}`} className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-semibold bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20 transition-all hover:scale-105 active:scale-95">
                  <UserRound className="w-4 h-4" />
                  Muallif: {novel.translator.name}
                </Link>
              </div>
            )}

            {novel.alternative_titles && (
              <p className="text-xs text-slate-400">
                Alternative: {JSON.parse(novel.alternative_titles).join(', ')}
              </p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 bg-slate-900/30 border border-white/5 py-3 px-5 rounded-2xl max-w-md">
            <div className="text-center space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400 text-xs justify-center">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Yoqdi</span>
              </div>
              <div className="font-bold text-sm">{likesCount}</div>
            </div>
            <div className="w-px h-6 bg-white/5"></div>
            <div className="text-center space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400 text-xs justify-center">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Ko'rildi</span>
              </div>
              <div className="font-bold text-sm">{novel.views_count.toLocaleString()}</div>
            </div>
            <div className="w-px h-6 bg-white/5"></div>
            <div className="text-center space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400 text-xs justify-center">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Reyting</span>
              </div>
              <div className="font-bold text-sm">{novel.rating_avg ? parseFloat(String(novel.rating_avg)).toFixed(1) : '0.0'}</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Novel haqida</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              {novel.description || 'Tavsif berilmagan.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleLikeToggle}
              className={`px-4 py-2.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLiked
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-slate-900 border-white/5 text-slate-300 hover:border-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              Asar menga yoqdi ({likesCount})
            </button>

            {/* Interactive Rating Panel */}
            <div className="flex items-center gap-2 p-2 px-3 bg-slate-900/40 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-400 font-semibold">Baholang:</span>
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
                      className="p-0.5 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          fillStar 
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]' 
                            : 'text-slate-600 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Chapters list */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-200 border-b border-white/5 pb-2">Boblar ro'yxati ({chapters.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.length === 0 ? (
            <p className="text-slate-500 text-sm italic col-span-2">Ushbu novelda boblar hali yozilmagan.</p>
          ) : (
            chapters.map((ch) => {
              const locked = isChapterLocked(ch);
              const pending = getPendingStatus(ch);
              return (
                <div
                  key={ch.id}
                  className="glass-card p-4 border border-white/5 rounded-2xl flex items-center justify-between bg-slate-900/30 hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    {locked ? (
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                        <Lock className="w-4 h-4 text-slate-500" />
                        <span>Bob {ch.chapter_number} {ch.title ? `- ${ch.title}` : ''}</span>
                      </div>
                    ) : (
                      <Link
                        href={`/novels/${novel.slug}/${ch.id}`}
                        className="flex items-center gap-2 text-violet-400 hover:text-violet-300 font-bold text-sm"
                      >
                        <Unlock className="w-4 h-4 text-emerald-400" />
                        <span>Bob {ch.chapter_number} {ch.title ? `- ${ch.title}` : ''}</span>
                      </Link>
                    )}
                    <span className="text-[10px] text-slate-500">
                      Chop etildi: {new Date(ch.published_at).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>

                  <div>
                    {ch.is_free ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Bepul
                      </span>
                    ) : locked ? (
                      pending ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded animate-pulse">
                          Kutilmoqda
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenPurchase('single_chapter', ch)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                        >
                          Bobni sotib olish ({ch.price_in_uzs.toLocaleString()} UZS)
                        </button>
                      )
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Ochiq
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Trending Manhwas & Novels Section */}
      {trendingItems.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              🔥 Trenddagilar (Ommabop)
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {trendingItems.slice(0, 6).map((item) => (
              <SeriesCard key={`${item.type || 'series'}-${item.id}`} series={item} />
            ))}
          </div>
        </div>
      )}

      {/* Direct Card payment upload Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-100">Kvitansiya muvaffaqiyatli yuborildi</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  To'lov kvitansiyangiz novel muallifiga yuborildi. U to'lovni tasdiqlashi bilan bob yoki obuna siz uchun ochiladi.
                </p>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <h3 className="font-bold text-base text-slate-100 border-b border-white/5 pb-2">
                  To'lovni amalga oshirish
                </h3>

                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Xarid turi</div>
                  <div className="text-sm font-bold text-slate-200">
                    {purchaseType === 'single_chapter' && targetChapter && `Bob ${targetChapter.chapter_number} xaridi`}
                    {purchaseType === 'subscription_1m' && '1 oylik obuna'}
                    {purchaseType === 'subscription_3m' && '3 oylik obuna'}
                    {purchaseType === 'subscription_6m' && '6 oylik obuna'}
                  </div>
                </div>

                {creatorCards.length === 0 ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                    Novel muallifi hali bank kartasini qo'shmagan. Iltimos, keyinroq urinib ko'ring yoki ma'murlar bilan bog'laning.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Muallifning bank kartasi</label>
                      <div className="space-y-2">
                        {creatorCards.map(card => {
                          const isSelected = selectedCardId === String(card.id);
                          return (
                            <div
                              key={card.id}
                              onClick={() => setSelectedCardId(String(card.id))}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-violet-600/10 border-violet-500 text-white'
                                  : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-violet-400">{card.bank_name}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCard(card.card_number, card.id);
                                  }}
                                  className="flex items-center gap-0.5 hover:text-white transition-colors cursor-pointer text-[9px]"
                                >
                                  {copiedId === card.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Nusxalandi</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Nusxalash</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="text-sm font-bold tracking-widest font-mono mt-1 text-slate-200">
                                {card.card_number.replace(/(.{4})/g, '$1 ')}
                              </div>
                              <div className="text-[9px] text-slate-500 uppercase mt-0.5">
                                Egasi: <span className="text-slate-400 font-semibold">{card.card_holder_name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">To'lov kvitansiyasi (Screenshot)</label>
                      <div className="relative border border-dashed border-white/10 hover:border-violet-500/30 rounded-xl p-4 transition-colors flex flex-col items-center justify-center text-center cursor-pointer">
                        <input
                          type="file"
                          required
                          accept="image/*"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-6 h-6 text-slate-500 mb-1" />
                        {receiptFile ? (
                          <span className="text-xs text-emerald-400 font-bold">{receiptFile.name}</span>
                        ) : (
                          <span className="text-xs text-slate-400 text-[10px]">Rasm yuklash yoki tashlash</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white rounded-xl font-bold text-xs shadow-md shadow-violet-500/10 cursor-pointer transition-colors"
                    >
                      {submittingPayment ? 'Kvitansiya yuborilmoqda...' : 'To\'lovni tasdiqlash uchun yuborish'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
