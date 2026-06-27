'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { getImageUrl } from '@/components/SeriesCard';
import { Library, Plus, Edit, Trash2, BookOpen, X, AlertCircle, FileText } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface Chapter {
  id: number;
  chapter_number: number;
  title: string | null;
  is_free: boolean;
  price_in_uzs: number;
  content_text?: string;
  published_at?: string;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
  alternative_titles?: string;
  description?: string;
  cover_image: string | null;
  type: string;
  status: string;
  is_mature: boolean;
  price_1m: number | null;
  price_3m: number | null;
  price_6m: number | null;
  genres: Genre[];
}

export default function AdminNovelsPage() {
  const { token, user } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'novels' | 'chapters'>('novels');

  // Data lists
  const [novelsList, setNovelsList] = useState<Novel[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* ==========================================
     TAB 1: NOVELS FORM STATES
     ========================================== */
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [showNovelForm, setShowNovelForm] = useState<boolean>(false);
  const [nTitle, setNTitle] = useState<string>('');
  const [nSlug, setNSlug] = useState<string>('');
  const [nAltTitles, setNAltTitles] = useState<string>('');
  const [nDescription, setNDescription] = useState<string>('');
  const [nStatus, setNStatus] = useState<string>('ongoing');
  const [nMature, setNMature] = useState<boolean>(false);
  const [nCover, setNCover] = useState<File | null>(null);
  const [nGenres, setNGenres] = useState<number[]>([]);
  


  /* ==========================================
     TAB 2: CHAPTERS FORM STATES
     ========================================== */
  const [chSelectedNovel, setChSelectedNovel] = useState<string>('');
  const [chaptersList, setChaptersList] = useState<Chapter[]>([]);
  const [showChapterForm, setShowChapterForm] = useState<boolean>(false);
  const [chNumber, setChNumber] = useState<string>('');
  const [chTitle, setChTitle] = useState<string>('');
  const [chFree, setChFree] = useState<boolean>(true);
  const [chPriceUzs, setChPriceUzs] = useState<string>('0');
  const [chContent, setChContent] = useState<string>('');
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const novelsRes = await fetch(`${API_URL}/creator/novels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const genresRes = await fetch(`${API_URL}/genres`);

      if (novelsRes.ok && genresRes.ok) {
        setNovelsList(await novelsRes.json());
        setGenres(await genresRes.json());
      } else {
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi.');
      }
    } catch (err) {
      setError('Tarmoq xatosi. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Load chapters when novel selection changes
  useEffect(() => {
    if (!chSelectedNovel) {
      setChaptersList([]);
      return;
    }
    const fetchChapters = async () => {
      try {
        const res = await fetch(`${API_URL}/series/${chSelectedNovel}/chapters`);
        if (res.ok) {
          setChaptersList(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchChapters();
  }, [chSelectedNovel]);

  /* ==========================================
     NOVEL CRUD HANDLERS
     ========================================== */
  const handleOpenAddNovel = () => {
    setEditingNovel(null);
    setNTitle('');
    setNSlug('');
    setNAltTitles('');
    setNDescription('');
    setNStatus('ongoing');
    setNMature(false);
    setNCover(null);
    setNGenres([]);
    setShowNovelForm(true);
  };

  const handleOpenEditNovel = (novel: Novel) => {
    setEditingNovel(novel);
    setNTitle(novel.title);
    setNSlug(novel.slug);
    setNDescription(novel.description || '');
    setNStatus(novel.status);
    setNMature(novel.is_mature);
    setNCover(null);
    setNGenres(novel.genres.map((g) => g.id));

    let alt = '';
    try {
      if (novel.alternative_titles) {
        const parsed = JSON.parse(novel.alternative_titles);
        alt = Array.isArray(parsed) ? parsed.join(', ') : '';
      }
    } catch {
      alt = '';
    }
    setNAltTitles(alt);
    setShowNovelForm(true);
  };

  const handleNovelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('title', nTitle);
    if (nSlug) formData.append('slug', nSlug);
    formData.append('description', nDescription);
    formData.append('status', nStatus);
    formData.append('is_mature', nMature ? '1' : '0');

    // Alternative Titles list
    const altArray = nAltTitles
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    altArray.forEach((item, index) => {
      formData.append(`alternative_titles[${index}]`, item);
    });

    // Genres
    nGenres.forEach((id, index) => {
      formData.append(`genres[${index}]`, String(id));
    });

    if (nCover) {
      formData.append('cover_image', nCover);
    }

    const url = editingNovel
      ? `${API_URL}/creator/novels/${editingNovel.id}`
      : `${API_URL}/creator/novels`;

    try {
      const res = await fetch(url, {
        method: 'POST', // POST handles multipart files in both create & update
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      if (res.ok) {
        setShowNovelForm(false);
        loadData();
      } else {
        const data = await res.json();
        setError(data.message || 'Novel saqlashda xatolik.');
      }
    } catch (err) {
      setError('Novel yuborishda tarmoq xatosi.');
    }
  };

  const handleDeleteNovel = async (id: number) => {
    if (!confirm('Haqiqatan ham ushbu novelni o\'chirmoqchimisiz? Barcha boblar ham birga o\'chib ketadi.')) return;

    try {
      const res = await fetch(`${API_URL}/creator/novels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        loadData();
      } else {
        setError('O\'chirishda xatolik yuz berdi.');
      }
    } catch (err) {
      setError('O\'chirishda tarmoq xatosi.');
    }
  };

  /* ==========================================
     CHAPTER CRUD HANDLERS
     ========================================== */
  const handleOpenAddChapter = () => {
    if (!chSelectedNovel) {
      alert('Iltimos, avval novelni tanlang.');
      return;
    }
    setEditingChapter(null);
    setChNumber('');
    setChTitle('');
    setChFree(true);
    setChPriceUzs('0');
    setChContent('');
    setShowChapterForm(true);
  };

  const handleOpenEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChNumber(String(chapter.chapter_number));
    setChTitle(chapter.title || '');
    setChFree(chapter.is_free);
    setChPriceUzs(String(chapter.price_in_uzs ?? '0'));
    setChContent(chapter.content_text || '');
    setShowChapterForm(true);
  };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chSelectedNovel) return;

    const payload = {
      chapter_number: chNumber,
      title: chTitle,
      is_free: chFree,
      price_in_uzs: chFree ? '0' : chPriceUzs,
      content_text: chContent,
    };

    const url = editingChapter
      ? `${API_URL}/creator/chapters/${editingChapter.id}`
      : `${API_URL}/creator/novels/${chSelectedNovel}/chapters`;

    const method = editingChapter ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowChapterForm(false);
        // Refresh chapters
        const reloadRes = await fetch(`${API_URL}/series/${chSelectedNovel}/chapters`);
        if (reloadRes.ok) {
          setChaptersList(await reloadRes.json());
        }
      } else {
        const data = await res.json();
        alert(data.message || 'Bobni saqlashda xatolik yuz berdi.');
      }
    } catch (err) {
      alert('Bob yuborishda tarmoq xatosi.');
    }
  };

  const handleDeleteChapter = async (id: number) => {
    if (!confirm('Haqiqatan ham ushbu bobni o\'chirmoqchimisiz?')) return;

    try {
      const res = await fetch(`${API_URL}/creator/chapters/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setChaptersList((ch) => ch.filter((item) => item.id !== id));
      } else {
        alert('Bobni o\'chirishda xatolik.');
      }
    } catch (err) {
      alert('Tarmoq xatosi.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-400" />
            Novellalar Boshqaruvi
          </h1>
          <p className="text-slate-400 text-sm mt-1">Yozgan novellalaringiz va ularning matnli boblarini tahrirlash</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveTab('novels')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'novels'
              ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mening Novellalarim
        </button>
        <button
          onClick={() => setActiveTab('chapters')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'chapters'
              ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Boblar Ro'yxati (Text)
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Novels Grid */}
      {activeTab === 'novels' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleOpenAddNovel}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-violet-500/10 transition-colors"
            >
              <Plus className="w-4.5 h-4.5" />
              Yangi Novel Qo'shish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-slate-400 text-center col-span-3 py-12">Yuklanmoqda...</p>
            ) : novelsList.length === 0 ? (
              <p className="text-slate-400 text-center col-span-3 py-12">Sizda hali novellalar mavjud emas. Yangi qo'shing!</p>
            ) : (
              novelsList.map((novel) => (
                <div key={novel.id} className="glass-card p-5 border border-white/5 rounded-2xl flex gap-4 bg-slate-900/40 relative">
                  <div className="w-24 h-36 bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                    <img
                      src={getImageUrl(novel.cover_image)}
                      alt={novel.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-100 text-base truncate" title={novel.title}>{novel.title}</h3>
                      <div className="flex flex-wrap gap-1">
                        {novel.genres.slice(0, 2).map((g) => (
                          <span key={g.id} className="text-[10px] bg-slate-800 border border-white/5 text-slate-400 px-1.5 py-0.5 rounded">
                            {g.name}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Status: <span className="font-semibold text-slate-300">{novel.status}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        1 oylik: <span className="text-emerald-400">{(novel.price_1m ?? 0).toLocaleString()} UZS</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => handleOpenEditNovel(novel)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDeleteNovel(novel.id)}
                        className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg cursor-pointer transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Chapters View */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Novel tanlang</label>
              <select
                value={chSelectedNovel}
                onChange={(e) => setChSelectedNovel(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">-- Novellar ro'yxati --</option>
                {novelsList.map((novel) => (
                  <option key={novel.id} value={novel.slug}>{novel.title}</option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={handleOpenAddChapter}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-violet-500/10 transition-colors"
              >
                <Plus className="w-4.5 h-4.5" />
                Yangi Bob Qo'shish
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-300">Bob raqami</th>
                    <th className="px-6 py-4 font-semibold text-slate-300">Sarlavha (Title)</th>
                    <th className="px-6 py-4 font-semibold text-slate-300">Turi (Free/Paid)</th>
                    <th className="px-6 py-4 font-semibold text-slate-300">Narxi (UZS)</th>
                    <th className="px-6 py-4 font-semibold text-slate-300 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {!chSelectedNovel ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">Avval yuqoridan novel tanlang.</td>
                    </tr>
                  ) : chaptersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Ushbu novelda boblar hali yuborilmagan.</td>
                    </tr>
                  ) : (
                    chaptersList.map((ch) => (
                      <tr key={ch.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-200">Bob {ch.chapter_number}</td>
                        <td className="px-6 py-4 text-slate-300">{ch.title || <span className="text-slate-500 italic">Nomsiz</span>}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            ch.is_free
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {ch.is_free ? 'Bepul' : 'Pullik'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-200">
                          {ch.is_free ? '-' : `${(ch.price_in_uzs ?? 0).toLocaleString()} UZS`}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditChapter(ch)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(ch.id)}
                              className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg cursor-pointer transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Novel Add/Edit Modal Form */}
      {showNovelForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleNovelSubmit} className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 my-8">
            <button
              type="button"
              onClick={() => setShowNovelForm(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
              <FileText className="w-5 h-5 text-violet-400" />
              {editingNovel ? 'Novelni tahrirlash' : 'Yangi novel yaratish'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Novel nomi</label>
                <input
                  type="text"
                  required
                  value={nTitle}
                  onChange={(e) => setNTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  placeholder="Novel sarlavhasi"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Slug (link uchun)</label>
                <input
                  type="text"
                  value={nSlug}
                  onChange={(e) => setNSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  placeholder="auto-generated agar bo'sh bo'lsa"
                />
              </div>
            </div>

            {/* Alternative Titles */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Muqobil nomlari (vergul bilan ajratib yozing)</label>
              <input
                type="text"
                value={nAltTitles}
                onChange={(e) => setNAltTitles(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                placeholder="Alternative 1, Alternative 2"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tavsif (Description)</label>
              <textarea
                value={nDescription}
                onChange={(e) => setNDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors resize-none"
                placeholder="Novel haqida batafsil ma'lumot..."
              />
            </div>

            {/* cover & status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Holati (Status)</label>
                <select
                  value={nStatus}
                  onChange={(e) => setNStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="ongoing">Davom etmoqda</option>
                  <option value="completed">Tugallangan</option>
                  <option value="paused">To'xtatilgan</option>
                  <option value="dropped">Tashlab ketilgan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Muqova rasmi (10MB max)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNCover(e.target.files?.[0] || null)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-400 text-xs px-2 py-2 rounded-xl outline-none file:bg-slate-800 file:border-0 file:text-white file:text-xs file:py-1 file:px-2 file:rounded-md cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 flex items-center pt-5">
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nMature}
                    onChange={(e) => setNMature(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-950 border-white/10"
                  />
                  <span>18+ (Mature)</span>
                </label>
              </div>
            </div>



            {/* Genres Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Janrlar</label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-white/10">
                {genres.map((g) => {
                  const isChecked = nGenres.includes(g.id);
                  return (
                    <label
                      key={g.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-violet-600/20 border-violet-500 text-white'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setNGenres(nGenres.filter((id) => id !== g.id));
                          } else {
                            setNGenres([...nGenres, g.id]);
                          }
                        }}
                        className="hidden"
                      />
                      <span>{g.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowNovelForm(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl font-bold text-sm cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chapter Add/Edit Modal Form */}
      {showChapterForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleChapterSubmit} className="bg-slate-900 border border-white/10 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative space-y-4 my-8">
            <button
              type="button"
              onClick={() => setShowChapterForm(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
              <FileText className="w-5 h-5 text-violet-400" />
              {editingChapter ? 'Bobni tahrirlash' : 'Yangi bob qo\'shish'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chapter Number */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bob raqami</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={chNumber}
                  onChange={(e) => setChNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  placeholder="e.g. 1"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bob sarlavhasi (Ixtiyoriy)</label>
                <input
                  type="text"
                  value={chTitle}
                  onChange={(e) => setChTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  placeholder="Masalan: Birinchi uchrashuv"
                />
              </div>

              {/* Free check */}
              <div className="space-y-1.5 flex items-center pt-5">
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chFree}
                    onChange={(e) => setChFree(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-950 border-white/10"
                  />
                  <span>Bepul bob (Free)</span>
                </label>
              </div>
            </div>

            {/* Price UZS if paid */}
            {!chFree && (
              <div className="space-y-1.5 max-w-sm">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sotib olish narxi (UZS)</label>
                <input
                  type="number"
                  required
                  value={chPriceUzs}
                  onChange={(e) => setChPriceUzs(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  placeholder="Masalan: 2000"
                />
              </div>
            )}

            {/* Text Editor (textarea) */}
            <div className="space-y-1.5 flex-1 flex flex-col">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bobning matnli tarkibi (UZBEK TEXT)</label>
              <textarea
                value={chContent}
                onChange={(e) => setChContent(e.target.value)}
                required
                rows={12}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-3 rounded-xl outline-none focus:border-violet-500 transition-colors resize-y font-serif leading-relaxed"
                placeholder="Bob matnini shu yerga yozing..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowChapterForm(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl font-bold text-sm cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Bobni Saqlash
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
