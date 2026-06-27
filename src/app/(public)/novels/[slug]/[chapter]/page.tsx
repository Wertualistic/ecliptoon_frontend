'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { ChevronLeft, ChevronRight, Lock, ArrowLeft, Coins, HelpCircle, Eye, MessageSquare, Plus, Check } from 'lucide-react';
import Link from 'next/link';

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar: string | null;
  content: string;
  created_at: string;
}

interface ChapterDetails {
  id: number;
  novel_id?: number;
  novel_title?: string;
  novel_slug?: string;
  series_id?: number;
  series_title?: string;
  series_slug?: string;
  chapter_number: number;
  title: string | null;
  is_free: boolean;
  price_in_uzs: number;
  is_locked: boolean;
  published_at: string;
  content_text?: string;
}

interface SeriesChapter {
  id: number;
  chapter_number: number;
}

export default function NovelReaderPage() {
  const { slug, chapter: chapterId } = useParams();
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const [chapter, setChapter] = useState<ChapterDetails | null>(null);
  const [allChapters, setAllChapters] = useState<SeriesChapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [fontSize, setFontSize] = useState<number>(18); // default 18px
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [theme, setTheme] = useState<'dark' | 'light' | 'sepia'>('dark');

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [postingComment, setPostingComment] = useState<boolean>(false);

  const fetchChapter = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/novel-chapters/${chapterId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setChapter(data);

        const slugToFetch = data.novel_slug || data.series_slug;
        const chaptersListRes = await fetch(`${API_URL}/series/${slugToFetch}/chapters`);
        if (chaptersListRes.ok) {
          const list = await chaptersListRes.json();
          setAllChapters(list.sort((a: any, b: any) => a.chapter_number - b.chapter_number));
        }
      } else {
        if (res.status === 403) {
          setError('Ushbu bobni o\'qish uchun sizda ruxsat yo\'q. Iltimos, obuna bo\'ling yoki bobni sotib oling.');
        } else {
          setError('Bob yuklashda xatolik yuz berdi.');
        }
      }
    } catch (err) {
      setError('Tarmoq xatosi yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`${API_URL}/novel-chapters/${chapterId}/comments`);
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

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setPostingComment(true);
    try {
      const res = await fetch(`${API_URL}/novel-chapters/${chapterId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  // Find prev/next chapter ids
  const getNavChapters = () => {
    if (!chapter || allChapters.length === 0) return { prev: null, next: null };
    const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
    return {
      prev: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
      next: currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null,
    };
  };

  const { prev, next } = getNavChapters();

  // Parse chapter paragraphs
  const renderTextContent = () => {
    if (!chapter?.content_text) return null;
    return chapter.content_text.split('\n').map((para, i) => {
      const trimmed = para.trim();
      if (!trimmed) return <br key={i} />;
      return (
        <p key={i} className="mb-6 indent-4 leading-relaxed tracking-wide text-justify break-words [overflow-wrap:anywhere]">
          {trimmed}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>Yuklanmoqda...</span>
      </div>
    );
  }

  if (error || (chapter && chapter.is_locked)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6 text-slate-100">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500">
            <Lock className="w-16 h-16" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Ushbu bob qulflangan</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          {error || 'Ushbu bobni o\'qish uchun sizda faol obuna bo\'lishi yoki ushbu bobni alohida sotib olgan bo\'lishingiz kerak.'}
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href={`/novels/${slug}`}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-md cursor-pointer"
          >
            Obuna va Xarid Sahifasiga o'tish
          </Link>
          <Link
            href="/novels"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 rounded-xl font-bold text-sm cursor-pointer"
          >
            Boshqa novellalar
          </Link>
        </div>
      </div>
    );
  }

  if (!chapter) return null;

  // Set theme background styles
  const getThemeClass = () => {
    if (theme === 'light') return 'bg-amber-50/70 text-slate-900 border border-amber-100';
    if (theme === 'sepia') return 'bg-amber-100/90 text-amber-950 border border-amber-200/50';
    return 'bg-slate-900/30 text-slate-200 border border-white/5';
  };

  const getFontFamilyClass = () => {
    if (fontFamily === 'serif') return 'font-serif';
    if (fontFamily === 'mono') return 'font-mono';
    return 'font-sans';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Top Header / Nav */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <Link
          href={`/novels/${chapter.novel_slug || chapter.series_slug}`}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {chapter.novel_title || chapter.series_title} ga qaytish
        </Link>

        <h2 className="text-sm font-bold text-slate-300">
          Bob {chapter.chapter_number} {chapter.title ? `- ${chapter.title}` : ''}
        </h2>
      </div>

      {/* Reader Options Bar */}
      <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between bg-slate-900/50 text-xs">
        {/* Font size */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Matn hajmi</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize(size => Math.max(12, size - 2))}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-bold transition-colors cursor-pointer"
            >
              A-
            </button>
            <span className="px-2 font-bold font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize(size => Math.min(32, size + 2))}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-bold transition-colors cursor-pointer"
            >
              A+
            </button>
          </div>
        </div>

        {/* Font family */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Shrift</span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5">
            {(['serif', 'sans', 'mono'] as const).map(font => (
              <button
                key={font}
                onClick={() => setFontFamily(font)}
                className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  fontFamily === font ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {font === 'serif' ? 'Serif' : font === 'sans' ? 'Sans' : 'Mono'}
              </button>
            ))}
          </div>
        </div>

        {/* Theme mode */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Mavzu</span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5">
            {(['dark', 'light', 'sepia'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  theme === t ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'dark' ? 'Qorong\'u' : t === 'light' ? 'Yorug\'' : 'Sepiya'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Text Content Area */}
      <div
        className={`p-8 sm:p-12 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden break-words ${getThemeClass()} ${getFontFamilyClass()}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-2xl mx-auto space-y-1">
          {/* Chapter title header in the text */}
          <div className="text-center mb-12 space-y-2 border-b pb-6 border-current/10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bob {chapter.chapter_number}
            </h1>
            {chapter.title && <p className="text-sm font-semibold italic opacity-85">{chapter.title}</p>}
          </div>

          {/* Paragraphs body */}
          <div className="text-justify font-normal leading-loose break-words [overflow-wrap:anywhere]">
            {renderTextContent()}
          </div>
        </div>
      </div>

      {/* Next/Prev Navigation */}
      <div className="flex justify-between items-center pt-4">
        {prev ? (
          <Link
            href={`/novels/${slug}/${prev.id}`}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Oldingi bob ({prev.chapter_number})
          </Link>
        ) : (
          <div className="opacity-0">-</div>
        )}

        {next ? (
          <Link
            href={`/novels/${slug}/${next.id}`}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-violet-500/5"
          >
            Keyingi bob ({next.chapter_number})
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="opacity-0">-</div>
        )}
      </div>

      {/* Comments Section */}
      <div className="space-y-6 pt-12 border-t border-white/5">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          Fikrlar ({comments.length})
        </h3>

        {/* Comment box */}
        {isAuthenticated ? (
          <form onSubmit={handlePostComment} className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                rows={3}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-3 rounded-xl outline-none focus:border-violet-500 transition-colors resize-none"
                placeholder="Asar haqida o'z fikringizni qoldiring..."
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={postingComment}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  {postingComment ? 'Yozilmoqda...' : 'Fikr qoldirish'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-slate-900/30 border border-white/5 rounded-xl text-center text-xs text-slate-400">
            Fikr qoldirish uchun iltimos <Link href="/login" className="text-violet-400 hover:underline">tizimga kiring</Link>.
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {commentsLoading ? (
            <p className="text-slate-400 text-center py-4 text-xs">Fikrlar yuklanmoqda...</p>
          ) : comments.length === 0 ? (
            <p className="text-slate-500 italic text-center py-4 text-xs">Ushbu bobda hali fikrlar bildirilmagan. Birinchi bo'ling!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-4 p-4 bg-slate-900/20 border border-white/5 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {c.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">{c.user_name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(c.created_at).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed text-justify whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
