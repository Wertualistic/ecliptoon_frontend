"use client";

import React, { useEffect, useState } from "react";
import { useAuth, API_URL } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nContext";
import { getImageUrl } from "@/components/SeriesCard";
import {
  Library,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Upload,
  Tag,
  X,
  ChevronRight,
  AlertCircle,
  FileText,
} from "lucide-react";

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface Sponsor {
  id: number;
  name: string;
}

interface Chapter {
  id: number;
  chapter_number: number;
  title: string | null;
  is_free: boolean;
  price_in_diamonds: number;
}

interface Series {
  id: number;
  title: string;
  slug: string;
  alternative_titles?: string;
  description?: string;
  cover_image: string | null;
  type: string;
  status: string;
  is_mature: boolean;
  is_pinned: boolean;
  is_slider: boolean;
  genres: Genre[];
  sponsors?: Sponsor[];
}

export default function AdminSeriesPage() {
  const { token, user } = useAuth();
  const { t } = useTranslation();

  const isTranslator = user?.role === "translator";

  // Translators go straight to chapters tab
  const [activeTab, setActiveTab] = useState<"series" | "chapters" | "genres">(
    isTranslator ? "chapters" : "series",
  );

  // Data lists
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Error states
  const [error, setError] = useState<string | null>(null);

  /* ==========================================
     TAB 1: SERIES FORM STATES
     ========================================== */
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [showSeriesForm, setShowSeriesForm] = useState<boolean>(false);
  const [sTitle, setSTitle] = useState<string>("");
  const [sSlug, setSSlug] = useState<string>("");
  const [sAltTitles, setSAltTitles] = useState<string>("");
  const [sDescription, setSDescription] = useState<string>("");
  const [sType, setSType] = useState<string>("manhwa");
  const [sStatus, setSStatus] = useState<string>("ongoing");
  const [sMature, setSMature] = useState<boolean>(false);
  const [sPinned, setSPinned] = useState<boolean>(false);
  const [sSlider, setSSlider] = useState<boolean>(false);
  const [sCover, setSCover] = useState<File | null>(null);
  const [sGenres, setSGenres] = useState<number[]>([]);
  const [sSponsors, setSSponsors] = useState<number[]>([]);

  /* ==========================================
     TAB 2: CHAPTERS FORM STATES
     ========================================== */
  const [chSelectedSeries, setChSelectedSeries] = useState<string>("");
  const [chaptersList, setChaptersList] = useState<Chapter[]>([]);
  const [showChapterForm, setShowChapterForm] = useState<boolean>(false);
  const [chNumber, setChNumber] = useState<string>("");
  const [chTitle, setChTitle] = useState<string>("");
  const [chFree, setChFree] = useState<boolean>(true);
  const [chPrice, setChPrice] = useState<string>("0");
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Images upload states
  const [uploadingChId, setUploadingChId] = useState<number | null>(null);
  const [uploadedPages, setUploadedPages] = useState<FileList | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  /* ==========================================
     TAB 3: GENRES FORM STATES
     ========================================== */
  const [gName, setGName] = useState<string>("");

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [seriesRes, genresRes, sponsorsRes] = await Promise.all([
        fetch(`${API_URL}/admin/series`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/genres`),
        fetch(`${API_URL}/sponsors`),
      ]);
      if (seriesRes.ok) setSeriesList(await seriesRes.json());
      if (genresRes.ok) setGenres(await genresRes.json());
      if (sponsorsRes.ok) setSponsors(await sponsorsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Load chapters when series changes
  useEffect(() => {
    if (chSelectedSeries) {
      const selected = seriesList.find(
        (s) => String(s.id) === chSelectedSeries,
      );
      if (selected) {
        fetch(`${API_URL}/series/${selected.slug}/chapters`)
          .then((res) => res.json())
          .then((data) => setChaptersList(data))
          .catch((err) => console.error(err));
      }
    } else {
      setChaptersList([]);
    }
  }, [chSelectedSeries, seriesList]);

  /* ==========================================
     SERIES CRUD METHODS
     ========================================== */
  const handleOpenAddSeries = () => {
    setEditingSeries(null);
    setSTitle("");
    setSSlug("");
    setSAltTitles("");
    setSDescription("");
    setSType("manhwa");
    setSStatus("ongoing");
    setSMature(false);
    setSPinned(false);
    setSSlider(false);
    setSCover(null);
    setSGenres([]);
    setSSponsors([]);
    setShowSeriesForm(true);
    setError(null);
  };

  const handleOpenEditSeries = (series: Series) => {
    setEditingSeries(series);
    setSTitle(series.title);
    setSSlug(series.slug);

    // Parse Alt titles
    try {
      const parsed =
        typeof series.alternative_titles === "string"
          ? JSON.parse(series.alternative_titles as any)
          : series.alternative_titles;
      setSAltTitles(Array.isArray(parsed) ? parsed.join(", ") : "");
    } catch {
      setSAltTitles("");
    }

    setSDescription(series.description || "");
    setSType(series.type);
    setSStatus(series.status);
    setSMature(series.is_mature);
    setSPinned(series.is_pinned);
    setSSlider(series.is_slider || false);
    setSCover(null);
    setSGenres(series.genres.map((g) => g.id));
    setSSponsors(series.sponsors ? series.sponsors.map((sp) => sp.id) : []);
    setShowSeriesForm(true);
    setError(null);
  };

  const handleSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("title", sTitle);
    if (sSlug) formData.append("slug", sSlug);
    formData.append("description", sDescription);
    formData.append("type", sType);
    formData.append("status", sStatus);
    formData.append("is_mature", sMature ? "1" : "0");
    formData.append("is_pinned", sPinned ? "1" : "0");
    formData.append("is_slider", sSlider ? "1" : "0");

    const alts = sAltTitles
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    alts.forEach((alt, i) => {
      formData.append(`alternative_titles[${i}]`, alt);
    });

    sGenres.forEach((gId, i) => {
      formData.append(`genres[${i}]`, String(gId));
    });

    sSponsors.forEach((spId, i) => {
      formData.append(`sponsors[${i}]`, String(spId));
    });

    if (sCover) {
      formData.append("cover_image", sCover);
    }

    try {
      const url = editingSeries
        ? `${API_URL}/admin/series/${editingSeries.id}`
        : `${API_URL}/admin/series`;

      // Laravel expects POST for multipart updates (we spoof PUT if updating)
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setShowSeriesForm(false);
        loadData();
      } else {
        setError(data.message || "Xatolik yuz berdi.");
      }
    } catch (err) {
      setError("Internet aloqasini tekshiring.");
    }
  };

  const handleDeleteSeries = async (id: number) => {
    if (
      !confirm(
        "Ushbu seriyani o'chirishni xohlaysizmi? Jami yuklangan rasmlar va boblar butunlay o'chib ketadi.",
      )
    )
      return;
    try {
      const res = await fetch(`${API_URL}/admin/series/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenreCheckbox = (id: number) => {
    setSGenres((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id],
    );
  };

  const handleSponsorCheckbox = (id: number) => {
    setSSponsors((prev) =>
      prev.includes(id) ? prev.filter((spId) => spId !== id) : [...prev, id],
    );
  };

  /* ==========================================
     CHAPTERS CRUD METHODS
     ========================================== */
  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chSelectedSeries || !chNumber) return;
    setError(null);
    try {
      const url = editingChapter
        ? `${API_URL}/admin/chapters/${editingChapter.id}`
        : `${API_URL}/admin/series/${chSelectedSeries}/chapters`;

      const method = editingChapter ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          chapter_number: parseFloat(chNumber),
          title: chTitle,
          is_free: chFree,
          price_in_diamonds: chFree ? 0 : parseInt(chPrice),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowChapterForm(false);
        setEditingChapter(null);
        setChNumber("");
        setChTitle("");
        setChFree(true);
        setChPrice("0");
        // reload chapters
        const selected = seriesList.find(
          (s) => String(s.id) === chSelectedSeries,
        );
        if (selected) {
          const chRes = await fetch(
            `${API_URL}/series/${selected.slug}/chapters`,
          );
          setChaptersList(await chRes.json());
        }
      } else {
        setError(
          data.errors?.chapter_number?.[0] ||
            data.message ||
            "Bob saqlashda xatolik.",
        );
      }
    } catch (err) {
      setError("Internet aloqasini tekshiring.");
    }
  };

  const handleOpenAddChapter = () => {
    setEditingChapter(null);
    setChNumber("");
    setChTitle("");
    setChFree(true);
    setChPrice("0");
    setShowChapterForm(true);
  };

  const handleOpenEditChapter = (ch: Chapter) => {
    setEditingChapter(ch);
    setChNumber(String(ch.chapter_number));
    setChTitle(ch.title || "");
    setChFree(ch.is_free);
    setChPrice(String(ch.price_in_diamonds));
    setShowChapterForm(true);
  };

  const handleUploadImages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingChId || !uploadedPages || uploadedPages.length === 0) return;
    setError(null);
    setUploadSuccess(false);

    const file = uploadedPages[0];
    if (file.size > 50 * 1024 * 1024) {
      setError("Fayl hajmi juda katta. Maksimal ruxsat etilgan hajm: 50MB.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(
        `${API_URL}/admin/chapters/${uploadingChId}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        },
      );

      if (res.ok) {
        setUploadSuccess(true);
        setUploadedPages(null);
        setUploadingChId(null);
        alert("PDF fayli muvaffaqiyatli yuklandi!");
      } else {
        const data = await res.json();
        setError(data.message || "PDF faylni yuklashda xatolik.");
      }
    } catch (err) {
      setError("Internet aloqasini tekshiring.");
    }
  };

  const handleDeleteChapter = async (id: number) => {
    if (!confirm("Ushbu bobni o'chirishni xohlaysizmi?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/chapters/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        // reload chapters
        const selected = seriesList.find(
          (s) => String(s.id) === chSelectedSeries,
        );
        if (selected) {
          const chRes = await fetch(
            `${API_URL}/series/${selected.slug}/chapters`,
          );
          setChaptersList(await chRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ==========================================
     GENRES CRUD METHODS
     ========================================== */
  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName.trim()) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/genres`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name: gName }),
      });

      if (res.ok) {
        setGName("");
        loadData();
      } else {
        const data = await res.json();
        setError(data.message || "Janr qo'shishda xatolik.");
      }
    } catch (err) {
      setError("Internet aloqasini tekshiring.");
    }
  };

  const handleDeleteGenre = async (id: number) => {
    if (!confirm("Ushbu janrni o'chirishni xohlaysizmi?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/genres/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Library className="w-6.5 h-6.5 text-red-400" />
            <span>Kino, Manga va Janrlar boshqaruvi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Seriallar qo'shish, boblar yuklash, sahifalarni yangilash hamda
            janrlar ro'yxatini sozlash
          </p>
        </div>

        {/* Tabs — all authorized users can see all tabs */}
        <div className="flex bg-slate-900 border border-white/5 rounded-xl p-1 text-xs">
          <button
            onClick={() => {
              setActiveTab("series");
              setError(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "series"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}>
            Seriallar
          </button>
          <button
            onClick={() => {
              setActiveTab("chapters");
              setError(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "chapters"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}>
            Boblar & Sahifalar
          </button>
          <button
            onClick={() => {
              setActiveTab("genres");
              setError(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "genres"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}>
            Janrlar
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl max-w-md">
          {error}
        </div>
      )}

      {
        /* ==========================================
         TAB 1: SERIES MANAGEMENT
         ========================================== */
        activeTab === "series" && (
          <div className="space-y-6">
            {showSeriesForm ? (
              /* Series Form Card */
              <div className="glass-card p-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 max-w-2xl">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                  {editingSeries
                    ? "Serialni tahrirlash"
                    : t("adminPanel.addSeries")}
                </h3>

                <form
                  onSubmit={handleSeriesSubmit}
                  className="space-y-4 text-xs text-slate-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-400">
                        {t("adminPanel.titleField")}
                      </label>
                      <input
                        type="text"
                        value={sTitle}
                        onChange={(e) => setSTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-2 rounded-xl outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-400">
                        Slug (URL uchun, ixtiyoriy)
                      </label>
                      <input
                        type="text"
                        value={sSlug}
                        placeholder="solo-leveling"
                        onChange={(e) => setSSlug(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-2 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-400">
                        {t("adminPanel.typeField")}
                      </label>
                      <select
                        value={sType}
                        onChange={(e) => setSType(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-2 rounded-xl outline-none">
                        <option value="manhwa">Manhwa</option>
                        <option value="manga">Manga</option>
                        <option value="manhua">Manhua</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-400">
                        {t("adminPanel.statusField")}
                      </label>
                      <select
                        value={sStatus}
                        onChange={(e) => setSStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-2 rounded-xl outline-none">
                        <option value="ongoing">Davom etmoqda (Ongoing)</option>
                        <option value="completed">
                          Tugallangan (Completed)
                        </option>
                        <option value="paused">To'xtatilgan (Paused)</option>
                        <option value="dropped">
                          Tashlab ketilgan (Dropped)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">
                      {t("adminPanel.alternativeTitlesField")}
                    </label>
                    <input
                      type="text"
                      value={sAltTitles}
                      placeholder="Alt title 1, Alt title 2"
                      onChange={(e) => setSAltTitles(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-2 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">
                      {t("adminPanel.descriptionField")}
                    </label>
                    <textarea
                      value={sDescription}
                      onChange={(e) => setSDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-2 rounded-xl outline-none resize-none"></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-400">
                        {t("adminPanel.coverImageField")}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSCover(e.target.files?.[0] || null)}
                        className="w-full text-xs"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <label className="flex items-center gap-2 font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={sMature}
                          onChange={(e) => setSMature(e.target.checked)}
                        />
                        <span>18+ (Mature)</span>
                      </label>
                      <label className="flex items-center gap-2 font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={sPinned}
                          onChange={(e) => setSPinned(e.target.checked)}
                        />
                        <span>Qadash (Pin)</span>
                      </label>
                      <label className="flex items-center gap-2 font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={sSlider}
                          onChange={(e) => setSSlider(e.target.checked)}
                        />
                        <span>Slayder (Slider)</span>
                      </label>
                    </div>
                  </div>

                  {/* Genre checkboxes */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 block mb-1">
                      {t("adminPanel.genresField")}
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-950 border border-white/5 rounded-xl max-h-32 overflow-y-auto">
                      {genres.map((g) => (
                        <label
                          key={g.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold cursor-pointer transition-colors ${
                            sGenres.includes(g.id)
                              ? "bg-violet-500/20 border-violet-500 text-violet-300"
                              : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-300"
                          }`}>
                          <input
                            type="checkbox"
                            checked={sGenres.includes(g.id)}
                            onChange={() => handleGenreCheckbox(g.id)}
                            className="hidden"
                          />
                          <span>{g.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sponsor checkboxes */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 block mb-1">
                      Homiy (Sponsor)
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-950 border border-white/5 rounded-xl max-h-32 overflow-y-auto">
                      {sponsors.length === 0 ? (
                        <span className="text-[10px] text-slate-500">
                          Homiylar mavjud emas.
                        </span>
                      ) : (
                        sponsors.map((sp) => (
                          <label
                            key={sp.id}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold cursor-pointer transition-colors ${
                              sSponsors.includes(sp.id)
                                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-300"
                            }`}>
                            <input
                              type="checkbox"
                              checked={sSponsors.includes(sp.id)}
                              onChange={() => handleSponsorCheckbox(sp.id)}
                              className="hidden"
                            />
                            <span>{sp.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSeriesForm(false)}
                      className="flex-1 py-2.5 bg-slate-900 border border-white/5 text-slate-300 hover:text-white rounded-xl font-bold cursor-pointer">
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold cursor-pointer">
                      {t("common.save")}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Series list */
              <div className="space-y-4">
                <button
                  onClick={handleOpenAddSeries}
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>{t("adminPanel.addSeries")}</span>
                </button>

                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seriesList.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 bg-slate-950/70 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(s.cover_image)}
                            alt={s.title}
                            className="w-10 aspect-[3/4] object-cover rounded bg-slate-900"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-slate-200 line-clamp-1">
                              {s.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">
                              {s.type || 'manhwa'} • {s.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleOpenEditSeries(s)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-lg cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSeries(s.id)}
                            className="p-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }

      {
        /* ==========================================
         TAB 2: CHAPTERS & PAGES MANAGEMENT
         ========================================== */
        activeTab === "chapters" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Chapter list for selected series */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="w-4.5 h-4.5 text-violet-400" />
                <span>Boblar ro'yxati</span>
              </h3>

              {/* Select Series */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">
                  Serialni tanlang
                </label>
                <select
                  value={chSelectedSeries}
                  onChange={(e) => setChSelectedSeries(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none">
                  <option value="">-- Tanlang --</option>
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter items list */}
              {chSelectedSeries ? (
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleOpenAddChapter}
                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("adminPanel.addChapter")}</span>
                  </button>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {chaptersList.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-3 bg-slate-950/70 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-200">
                            Bob {ch.chapter_number}
                          </span>
                          {ch.title && (
                            <span className="text-slate-400 ml-2">
                              - {ch.title}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 ml-3 font-semibold">
                            (
                            {ch.is_free
                              ? "Bepul"
                              : `${ch.price_in_diamonds} Olmos`}
                            )
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Page upload trigger */}
                          <button
                            onClick={() => {
                              setUploadingChId(ch.id);
                              setUploadSuccess(false);
                              setError(null);
                            }}
                            className="px-2.5 py-1.5 bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 text-violet-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Rasmlar yuklash</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditChapter(ch)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteChapter(ch.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Boblarini ko'rish uchun avval serialni tanlang.
                </div>
              )}
            </div>

            {/* Right Column: Modal Add forms/Upload forms */}
            <div className="lg:col-span-1 space-y-6">
              {/* 1. Add Chapter form */}
              {showChapterForm && (
                <div className="glass-card p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-4">
                  <div className="flex justify-between items-start border-b border-violet-500/10 pb-2">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {editingChapter
                        ? "Bobni tahrirlash"
                        : t("adminPanel.addChapter")}
                    </h3>
                    <button
                      onClick={() => setShowChapterForm(false)}
                      className="text-xs text-slate-400 hover:text-white">
                      X
                    </button>
                  </div>

                  <form
                    onSubmit={handleChapterSubmit}
                    className="space-y-3 text-xs text-slate-300">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-400">
                        {t("adminPanel.chapterNumberField")}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1"
                        value={chNumber}
                        onChange={(e) => setChNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-2 rounded-xl outline-none font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-400">
                        {t("adminPanel.titleField")}
                      </label>
                      <input
                        type="text"
                        value={chTitle}
                        onChange={(e) => setChTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-2 rounded-xl outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <label className="flex items-center gap-2 font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={chFree}
                          onChange={(e) => setChFree(e.target.checked)}
                        />
                        <span>Bepul bob</span>
                      </label>

                      {!chFree && (
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-400">
                            {t("adminPanel.priceField")}
                          </label>
                          <input
                            type="number"
                            value={chPrice}
                            onChange={(e) => setChPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3 py-1.5 rounded-xl outline-none font-bold"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold cursor-pointer mt-2">
                      Saqlash
                    </button>
                  </form>
                </div>
              )}

              {/* 2. Upload PDF drag box */}
              {uploadingChId && (
                <div className="glass-card p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-4">
                  <div className="flex justify-between items-start border-b border-violet-500/10 pb-2">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                      <Upload className="w-4 h-4 text-violet-400" />
                      <span>PDF faylini yuklash</span>
                    </h3>
                    <button
                      onClick={() => setUploadingChId(null)}
                      className="text-xs text-slate-400 hover:text-white">
                      X
                    </button>
                  </div>

                  <form onSubmit={handleUploadImages} className="space-y-4">
                    <div className="border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-xl p-6 relative bg-slate-950/40 text-center">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setUploadedPages(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <div className="space-y-1 text-slate-400 text-xs">
                        <Upload className="w-6 h-6 text-violet-400 mx-auto mb-1" />
                        {uploadedPages && uploadedPages.length > 0 ? (
                          <p className="font-bold text-emerald-400">
                            {uploadedPages[0].name}
                          </p>
                        ) : (
                          <p>PDF faylni tanlang yoki bu yerga sudrang</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs cursor-pointer">
                      PDF faylini saqlash
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )
      }

      {
        /* ==========================================
         TAB 3: GENRES MANAGEMENT
         ========================================== */
        activeTab === "genres" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left List */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                <Tag className="w-4.5 h-4.5 text-violet-400" />
                <span>Janrlar ro'yxati</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {genres.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 bg-slate-950/70 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">
                      {g.name}
                    </span>
                    <button
                      onClick={() => handleDeleteGenre(g.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">
                Yangi janr qo'shish
              </h3>

              <form onSubmit={handleAddGenre} className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="Janr nomi (masalan: Isekai)"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold cursor-pointer">
                  Janrni saqlash
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div>
  );
}
