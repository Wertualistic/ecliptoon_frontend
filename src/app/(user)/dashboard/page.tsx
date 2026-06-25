"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, API_URL } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nContext";
import {
  UserRound,
  Settings,
  Bell,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import Link from "next/link";
import { StrawberryIcon } from "@/components/StrawberryIcon";

interface Notification {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

interface Series {
  id: number;
  title: string;
}

function DashboardContent() {
  const { user, token, isAuthenticated, refreshUser, changePassword } = useAuth();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [matureAllowed, setMatureAllowed] = useState<boolean>(false);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(true);

  // Report issue form states
  const showReportFormParam = searchParams.get("report") === "true";
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [reportMsg, setReportMsg] = useState<string>("");
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Math captcha state
  const [captchaVal1, setCaptchaVal1] = useState<number>(0);
  const [captchaVal2, setCaptchaVal2] = useState<number>(0);
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("");
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);
  
  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);
  const [cpSuccess, setCpSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpError(null);
    setCpSuccess(null);
    if (!currentPassword || newPassword.length < 6) {
      setCpError("Yangi parol kamida 6 ta belgi bo'lishi kerak.");
      return;
    }
    setCpLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setCpLoading(false);
    if (res.success) {
      setCpSuccess("Parolingiz muvaffaqiyatli o'zgartirildi!");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setCpError(res.message || "Xatolik yuz berdi.");
    }
  };

  // Generate new math captcha
  const generateCaptcha = () => {
    setCaptchaVal1(Math.floor(Math.random() * 9) + 1); // 1 to 9
    setCaptchaVal2(Math.floor(Math.random() * 9) + 1); // 1 to 9
    setCaptchaAnswer("");
  };

  useEffect(() => {
    if (showReportFormParam) {
      generateCaptcha();
      // Fetch series titles for selection dropdown
      fetch(`${API_URL}/series`)
        .then((res) => res.json())
        .then((data) => setSeriesList(data.data || []))
        .catch((err) => console.error(err));
    }
  }, [showReportFormParam]);

  const loadNotifications = async () => {
    if (!token) return;
    setLoadingNotifs(true);
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadNotifications();
      const allowed = localStorage.getItem("show_mature_content") === "true";
      setMatureAllowed(allowed);
    }
  }, [token]);

  const handleMatureToggle = () => {
    const newVal = !matureAllowed;
    setMatureAllowed(newVal);
    localStorage.setItem("show_mature_content", String(newVal));
    if (newVal) {
      localStorage.setItem("mature_confirmed", "true");
    } else {
      localStorage.removeItem("mature_confirmed");
    }
  };

  const markRead = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportMsg.length < 10) {
      setReportError("Izoh matni kamida 10 ta belgidan iborat bo'lishi shart.");
      return;
    }

    const ans = parseInt(captchaAnswer);
    if (isNaN(ans) || ans !== captchaVal1 + captchaVal2) {
      setReportError(
        t("report.captchaLabel") +
          " javobi noto'g'ri. Iltimos qaytadan hisoblang.",
      );
      generateCaptcha();
      return;
    }

    setSubmittingReport(true);
    setReportError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: reportMsg,
          series_id: selectedSeries ? parseInt(selectedSeries) : null,
          captcha_val1: captchaVal1,
          captcha_val2: captchaVal2,
          captcha_answer: ans,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setReportSuccess(true);
        setReportMsg("");
        setSelectedSeries("");
      } else {
        setReportError(
          data.errors?.captcha_answer?.[0] ||
            data.message ||
            "Xabar yuborishda xatolik.",
        );
        generateCaptcha();
      }
    } catch (err) {
      setReportError("Internet aloqasini tekshiring.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-400 border-red-500/25";
      case "moderator":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      default:
        return "bg-violet-500/10 text-violet-400 border-violet-500/25";
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const res = await fetch(`${API_URL}/auth/user/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        // Refresh user context to get new avatar URL
        await refreshUser();
      } else {
        alert("Rasm yuklashda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Submenu */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4 mb-8">
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400">
          {t("common.profile")}
        </Link>
        <Link
          href="/dashboard/diamonds"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors">
          {t("common.wallet")}
        </Link>
        <Link
          href="/dashboard/buy-diamonds"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors">
          {t("topup.title")}
        </Link>
        <Link
          href="/dashboard/transactions"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors">
          {t("dashboard.recentTransactions")}
        </Link>
        <Link
          href="/dashboard/library"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 border border-transparent hover:border-white/5 transition-colors">
          {t("common.library")}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Profile Summary & Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* User detail card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 text-center space-y-4">
            <div className="relative mx-auto w-24 h-24 rounded-full border-2 border-violet-500/20 flex items-center justify-center text-slate-400 group overflow-hidden">
              {user.avatar_url ? (
                <img src={`${API_URL.replace(/\/api$/, '')}/storage/${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <UserRound className="w-10 h-10" />
                </div>
              )}
              
              <div 
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-xs text-white font-medium">
                  {uploadingAvatar ? "Yuklanmoqda..." : "O'zgartirish"}
                </span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp"
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>

            <div className="flex justify-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-white/5 bg-slate-950 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {user.is_banned
                  ? t("dashboard.bannedYes")
                  : t("dashboard.bannedNo")}
              </span>
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {t("dashboard.balanceCardTitle")}
                </span>
                <span className="font-extrabold text-amber-400">
                  {user.diamond_balance} <StrawberryIcon />
                </span>
              </div>
            </div>
          </div>

          {/* Quick toggle settings */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-slate-200 font-bold text-sm">
              <Settings className="w-4.5 h-4.5 text-violet-400" />
              <span>Sozlamalar</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">
                {t("dashboard.matureToggle")}
              </span>
              <button
                onClick={handleMatureToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  matureAllowed ? "bg-violet-500" : "bg-slate-800"
                }`}>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    matureAllowed ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-slate-200 font-bold text-sm">
              <Settings className="w-4.5 h-4.5 text-violet-400" />
              <span>Parolni o'zgartirish</span>
            </div>

            {cpError && <div className="text-[11px] text-red-400 bg-red-500/5 p-2 rounded-lg border border-red-500/10">{cpError}</div>}
            {cpSuccess && <div className="text-[11px] text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">{cpSuccess}</div>}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Joriy parol</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Yangi parol</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={cpLoading}
                className="w-full bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer"
              >
                {cpLoading ? "Yuklanmoqda..." : "Saqlash"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Tab Feed (Notifications OR Issue Reporting) */}
        <div className="lg:col-span-2 space-y-6">
          {showReportFormParam ? (
            /* Report Issue Form Panel */
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-5.5 h-5.5 text-red-500" />
                  {t("report.title")}
                </h3>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-xs text-slate-400 hover:text-white">
                  Xabarlar taxtiga qaytish
                </button>
              </div>

              <p className="text-xs text-slate-400">{t("report.desc")}</p>

              {reportSuccess ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-emerald-300">
                    {t("report.success")}
                  </p>
                  <button
                    onClick={() => setReportSuccess(false)}
                    className="px-4 py-2 bg-slate-900 border border-white/5 text-slate-200 text-xs rounded-lg hover:text-white cursor-pointer">
                    Yangi xabar yuborish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  {reportError && (
                    <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                      {reportError}
                    </div>
                  )}

                  {/* Series selection dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold">
                      Seriyani tanlang (ixtiyoriy)
                    </label>
                    <select
                      value={selectedSeries}
                      onChange={(e) => setSelectedSeries(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors">
                      <option value="">-- Seriyani tanlang --</option>
                      {seriesList.map((series) => (
                        <option key={series.id} value={series.id}>
                          {series.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold">
                      {t("report.messageLabel")}
                    </label>
                    <textarea
                      value={reportMsg}
                      onChange={(e) => setReportMsg(e.target.value)}
                      placeholder={t("report.messagePlaceholder")}
                      rows={5}
                      className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors resize-none"
                      required></textarea>
                  </div>

                  {/* Captcha validation */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                      <span>{t("report.captchaLabel")}</span>
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5">
                        <RefreshCw className="w-3 h-3" /> Yangilash
                      </button>
                    </label>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <div className="col-span-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-center text-slate-200 font-bold select-none">
                        {captchaVal1} + {captchaVal2} = ?
                      </div>
                      <input
                        type="text"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="Javob"
                        className="col-span-2 w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors text-center font-bold"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer">
                    {submittingReport ? (
                      t("common.loading")
                    ) : (
                      <>
                        <span>{t("report.submitBtn")}</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Notification Feed Panel */
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Bell className="w-5.5 h-5.5 text-violet-400" />
                  {t("dashboard.notificationsTitle")}
                </h3>
                {notifications.some((n) => !n.is_read) && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer">
                    {t("dashboard.markAllRead")}
                  </button>
                )}
              </div>

              {loadingNotifs ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-slate-900/50 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-3 ${
                        n.is_read
                          ? "bg-slate-900/20 border-white/5 text-slate-400"
                          : "bg-violet-500/5 border-violet-500/25 text-slate-100 shadow-md shadow-violet-500/5"
                      }`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {!n.is_read && (
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse flex-shrink-0"></span>
                          )}
                          <h4 className="font-bold text-sm">{n.title}</h4>
                        </div>
                        <p className="text-xs leading-relaxed">{n.body}</p>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(n.created_at).toLocaleString("uz-UZ")}
                        </span>
                      </div>

                      {!n.is_read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-[10px] bg-slate-950 border border-white/10 text-slate-300 hover:text-white px-2 py-1 rounded-md transition-colors cursor-pointer">
                          O'qildi deb belgilash
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-sm">
                  Yangi bildirishnomalar yo'q.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
      }>
      <DashboardContent />
    </Suspense>
  );
}
