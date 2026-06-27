'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { ChevronLeft, ChevronRight, Lock, ArrowLeft, Coins, Compass, AlertCircle, Camera, X, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { ImageZoomModal } from '@/components/ImageZoomModal';
import { StrawberryIcon } from '@/components/StrawberryIcon';
import YandexAd from '@/components/YandexAd';
import AdSenseAd from '@/components/AdSenseAd';

interface ChapterImage {
  id: number;
  image_url: string;
  order: number;
}

interface ChapterDetails {
  id: number;
  series_id: number;
  series_title: string;
  series_slug: string;
  chapter_number: number;
  title: string | null;
  is_free: boolean;
  price_in_diamonds: number;
  is_locked: boolean;
  published_at: string;
  images?: ChapterImage[];
  pages?: string[];
  pdf_url?: string;
}

interface SeriesChapter {
  id: number;
  chapter_number: number;
}

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar: string | null;
  content: string;
  image_url?: string | null;
  created_at: string;
}



interface SequentialError {
  message: string;
  prevChapterId: number | null;
}

// LazyImage is kept for normal images
const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative w-full ${!loaded ? 'min-h-[60vh] bg-slate-900 animate-pulse flex items-center justify-center border-b border-white/5' : ''}`}>
      {!loaded && (
        <div className="absolute text-slate-700 flex flex-col items-center justify-center">
           <div className="w-8 h-8 border-4 border-slate-800 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto block m-0 p-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default function ChapterReaderPage() {
  const { slug, chapter: chapterId } = useParams();
  const router = useRouter();
  const { token, isAuthenticated, user, refreshUser, updateUserBalance } = useAuth();
  const { t } = useTranslation();

  const [chapter, setChapter] = useState<ChapterDetails | null>(null);
  const [allChapters, setAllChapters] = useState<SeriesChapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sequentialError, setSequentialError] = useState<SequentialError | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [postingComment, setPostingComment] = useState<boolean>(false);

  // Comment Image attachment state
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch chapter details
  const fetchChapter = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSequentialError(null);
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/chapters/${chapterId}`, { headers });
      
      if (!res.ok) {
        if (res.status === 403) {
          const data = await res.json();
          if (data.code === 'sequential_locked') {
            setSequentialError({
              message: data.message,
              prevChapterId: data.prev_chapter_id || null
            });
            setLoading(false);
            return;
          }
        }
        router.push(`/series/${slug}`);
        return;
      }
      
      const data = await res.json();
      if (data.content_text || data.series_type === 'novel') {
        router.replace(`/novels/${slug}/${chapterId}`);
        return;
      }
      setChapter(data);

      // Fetch all chapters in the series to calculate next/prev links
      const allRes = await fetch(`${API_URL}/series/${slug}/chapters`);
      if (allRes.ok) {
        const chaptersList = await allRes.json();
        // Sort ascending by chapter number
        const sorted = chaptersList.sort((a: any, b: any) => a.chapter_number - b.chapter_number);
        setAllChapters(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`${API_URL}/chapters/${chapterId}/comments`);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (chapterId) {
      fetchChapter();
      fetchComments();
    }
  }, [chapterId, token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t('reader.commentImageSizeError'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setCommentImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCommentImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setCommentImage(null);
    setCommentImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || postingComment || !token) return;
    setPostingComment(true);
    try {
      const formData = new FormData();
      formData.append('content', newComment);
      if (commentImage) {
        formData.append('image', commentImage);
      }

      const res = await fetch(`${API_URL}/chapters/${chapterId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setNewComment('');
        setCommentImage(null);
        setCommentImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setComments(prev => [data.comment, ...prev]);
      } else {
        alert(data.message || 'Izoh qoldirishda xatolik yuz berdi.');
      }
    } catch (err) {
      alert('Internet aloqasini tekshiring.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!confirm('Izohni o\'chirishni xohlaysizmi?')) return;
    try {
      const res = await fetch(`${API_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== id));
      } else {
        alert(data.message || 'Izohni o\'chirishda xatolik yuz berdi.');
      }
    } catch (err) {
      alert('Internet aloqasini tekshiring.');
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!chapter) return;

    setPurchasing(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/chapters/${chapter.id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Xarid qilishda xatolik yuz berdi.');
        return;
      }

      // Update local state balance
      updateUserBalance(data.diamond_balance);
      
      // Refresh user context
      refreshUser();

      // Re-fetch the chapter to load images
      await fetchChapter();
    } catch (err) {
      setErrorMessage('Internet aloqasini tekshiring.');
    } finally {
      setPurchasing(false);
    }
  };

  // Find next and previous chapter IDs
  const getNavLinks = () => {
    if (!chapter || allChapters.length === 0) return { prevId: null, nextId: null };

    const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
    
    const prevId = currentIndex > 0 ? allChapters[currentIndex - 1].id : null;
    const nextId = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1].id : null;

    return { prevId, nextId };
  };

  const { prevId, nextId } = getNavLinks();

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  // Handle sequential error display first
  if (sequentialError) {
    return (
      <div className="bg-slate-950 min-h-screen pb-20 flex flex-col items-center justify-center px-4 animate-fade-in">
        <div className="w-full max-w-md p-8 glass-card border border-red-500/20 rounded-2xl text-center space-y-6 shadow-2xl shadow-red-500/5">
          <div className="flex justify-center">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">
              <AlertCircle className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Ketma-ket o'qish lozim ⚠️</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              {sequentialError.message}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {sequentialError.prevChapterId ? (
              <Link
                href={`/series/${slug}/${sequentialError.prevChapterId}`}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-all text-center cursor-pointer hover:scale-105 active:scale-95"
              >
                Avvalgi bobni o'qish
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-all text-center cursor-pointer hover:scale-105 active:scale-95"
              >
                Hisobga kirish (Tizimga kirish)
              </Link>
            )}
            
            <Link
              href={`/series/${slug}`}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 rounded-xl font-bold text-sm transition-all text-center cursor-pointer"
            >
              Manga sahifasiga qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className="bg-slate-950 min-h-screen pb-20 flex flex-col items-center animate-fade-in">
      {/* 1. Header Toolbar */}
      <div className="w-full max-w-3xl bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-16 z-30 px-4 py-3 flex items-center justify-between">
        <Link 
          href={`/series/${chapter.series_slug}`}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="max-w-[120px] sm:max-w-[200px] truncate">{chapter.series_title}</span>
        </Link>

        <span className="font-extrabold text-sm text-violet-400">
          {t('common.chapter')} {chapter.chapter_number}
        </span>

        <Link 
          href="/catalog"
          className="text-xs text-slate-400 hover:text-white"
        >
          <Compass className="w-4.5 h-4.5" />
        </Link>
      </div>

      {/* 2. Reader Body */}
      <div className="w-full max-w-2xl flex-grow flex flex-col items-center pt-4">
        {chapter.is_locked ? (
          /* Locked State Interface */
          <div className="w-full max-w-md my-16 p-8 glass-card border border-amber-500/20 rounded-2xl text-center space-y-6 animate-pulse-glow">
            <div className="flex justify-center">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 shadow-lg shadow-amber-500/5">
                <Lock className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">{t('reader.unlockTitle')}</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                {t('reader.unlockMessage')}
              </p>
            </div>

            <div className="flex justify-around items-center bg-slate-950/50 p-4 rounded-xl border border-white/5 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reader.unlockPrice')}</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">{chapter.price_in_diamonds} <StrawberryIcon /></span>
              </div>
              <div className="h-8 w-px bg-white/5"></div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reader.currentBalance')}</span>
                <span className="font-bold text-amber-400">
                  {isAuthenticated && user ? <span className="flex items-center gap-1">{user.diamond_balance} <StrawberryIcon /></span> : <span className="flex items-center gap-1">0 <StrawberryIcon /></span>}
                </span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 py-2 rounded-lg">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {isAuthenticated && user && user.diamond_balance >= chapter.price_in_diamonds ? (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-600 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {purchasing ? t('common.loading') : t('reader.unlockBtn')}
                </button>
              ) : (
                <>
                  <button
                    disabled
                    className="w-full py-3 bg-slate-800 text-slate-500 rounded-xl font-bold text-sm border border-white/5 cursor-not-allowed"
                  >
                    {t('reader.insufficientBalance')}
                  </button>
                  
                  <Link
                    href="/dashboard/buy-diamonds"
                    className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-all text-center"
                  >
                    {t('reader.buyDiamondsPrompt')}
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full select-none">
            {chapter.pages && chapter.pages.length > 0 ? (
              <div className="webtoon-container flex flex-col gap-0 w-full max-w-full overflow-hidden bg-slate-950">
                {chapter.pages.map((imgUrl, idx) => (
                  <LazyImage key={idx} src={imgUrl} alt={`Page ${idx + 1}`} />
                ))}
              </div>
            ) : chapter.pdf_url ? (
              <PdfIframeReader url={chapter.pdf_url} title={chapter.title || `Chapter ${chapter.chapter_number}`} />
            ) : chapter.images && chapter.images.length > 0 ? (
              <div className="webtoon-container flex flex-col gap-0 w-full max-w-full overflow-hidden bg-slate-950">
                {chapter.images.map((img) => (
                  <LazyImage key={img.id} src={img.image_url} alt={`Page ${img.order}`} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-sm">
                Ushbu bobda yuklangan PDF yoki rasmlar mavjud emas.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Yandex RTB Ad Unit */}
      {!chapter.is_locked && (
        <div className="w-full max-w-xl px-4">
          <YandexAd blockId="R-A-19493146-1" renderTo="yandex_rtb_R-A-19493146-1" />
        </div>
      )}

      {/* 3. Bottom Navigation bar */}
      {!chapter.is_locked && (
        <div className="w-full max-w-xl px-4 mt-12 flex items-center justify-between gap-4">
          {prevId ? (
            <Link
              href={`/series/${chapter.series_slug}/${prevId}`}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-violet-400" />
              <span>{t('reader.prevChapter')}</span>
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1 bg-slate-950 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('reader.prevChapter')}</span>
            </button>
          )}

          <Link
            href={`/series/${chapter.series_slug}`}
            className="text-xs text-slate-400 hover:text-white font-semibold transition-colors"
          >
            {t('reader.backToSeries')}
          </Link>

          {nextId ? (
            <Link
              href={`/series/${chapter.series_slug}/${nextId}`}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 transition-all"
            >
              <span>{t('reader.nextChapter')}</span>
              <ChevronRight className="w-4 h-4 text-violet-400" />
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1 bg-slate-950 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed"
            >
              <span>{t('reader.nextChapter')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Google AdSense Ad Unit */}
      {!chapter.is_locked && (
        <div className="w-full max-w-xl px-4 mt-8">
          <AdSenseAd slot="3484743574" />
        </div>
      )}

      {/* 4. Comments Section */}
      <div className="w-full max-w-xl px-4 mt-12 space-y-6">
        <div className="border-t border-white/5 pt-6">
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span>Fikrlar ({comments.length})</span>
          </h3>
          
          {/* Write comment form */}
          {isAuthenticated ? (
            <form onSubmit={handlePostComment} className="space-y-3 mb-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-xs text-violet-400 flex-shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Fikringizni qoldiring..."
                    maxLength={1000}
                    rows={3}
                    className="w-full bg-slate-900 border border-white/10 text-slate-200 text-xs p-3 rounded-xl outline-none focus:border-violet-500 resize-none transition-colors"
                    required
                  />

                  {/* Image Attachment Preview */}
                  {commentImagePreview && (
                    <div className="relative inline-block rounded-xl overflow-hidden border border-white/10 max-w-[120px] aspect-[4/3] bg-slate-950">
                      <img
                        src={commentImagePreview}
                        alt="Comment attachment preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-1 right-1 p-1 bg-slate-950/80 border border-white/10 text-slate-400 hover:text-white rounded-full hover:scale-105 transition-all cursor-pointer"
                        title={t('reader.commentImageClear')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                        id="comment-image-input"
                      />
                      <label
                        htmlFor="comment-image-input"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors font-semibold"
                        title={t('reader.commentAttachImage')}
                      >
                        <Camera className="w-3.5 h-3.5 text-violet-400" />
                        <span>{commentImage ? commentImage.name : t('reader.commentAttachImage')}</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>{newComment.length}/1000</span>
                      <button
                        type="submit"
                        disabled={postingComment || !newComment.trim()}
                        className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        {postingComment ? t('common.loading') : 'Yuborish'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl text-center mb-6">
              <p className="text-slate-400 text-xs mb-2">Fikr qoldirish uchun tizimga kiring.</p>
              <Link
                href="/login"
                className="inline-block px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Kirish
              </Link>
            </div>
          )}

          {/* Comment list */}
          {commentsLoading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Izohlar yuklanmoqda...
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 text-xs bg-slate-900/30 p-3.5 border border-white/5 rounded-xl animate-fade-in group">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                    {c.user_name ? c.user_name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300">{c.user_name}</span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(c.created_at).toLocaleDateString('uz-UZ', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    
                    {/* Attached image display */}
                    {c.image_url && (
                      <div className="relative inline-block max-w-[200px] max-h-[150px] rounded-lg overflow-hidden border border-white/5 shadow-md cursor-zoom-in mt-1">
                        <img
                          src={c.image_url}
                          alt="Comment attachment"
                          onClick={() => setZoomImageUrl(c.image_url || null)}
                          className="w-full h-full object-contain hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Delete button (owner or admin) */}
                    {(user?.id === c.user_id || (user?.role === 'admin' || user?.role === 'moderator')) && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-[9px] text-red-400/60 hover:text-red-400 font-bold transition-colors cursor-pointer"
                        >
                          O'chirish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Hozircha hech qanday fikr yo'q. Birinchi bo'lib fikr bildiring!
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal for Comment Images */}
      <ImageZoomModal
        isOpen={!!zoomImageUrl}
        imageUrl={zoomImageUrl || ''}
        title="Rasm ilovasi (Attachment)"
        onClose={() => setZoomImageUrl(null)}
      />
    </div>
  );
}

// Added Component to handle Iframe loading state
const PdfIframeReader = ({ url, title }: { url: string; title: string }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full aspect-[3/4] sm:h-[85vh] border border-white/10 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">PDF hujjat yuklanmoqda...</p>
          <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">Iltimos kuting, katta fayllar biroz vaqt olishi mumkin.</p>
        </div>
      )}
      <iframe
        src={`${url}#toolbar=0`}
        className="w-full h-full border-none relative z-20"
        title={title}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};
