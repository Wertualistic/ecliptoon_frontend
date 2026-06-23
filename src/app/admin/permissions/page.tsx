'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { ShieldCheck, CheckSquare, Square, AlertCircle, Save, Check } from 'lucide-react';

interface PermissionItem {
  key: string;
  label: string;
}

export default function AdminPermissionsPage() {
  const { token, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [permissionsList, setPermissionsList] = useState<PermissionItem[]>([]);
  const [activePermissions, setActivePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPermissions = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPermissionsList(data.permissions_list || []);
        // Transform the active permissions object from backend response
        const active: Record<string, string[]> = {};
        data.roles.forEach((role: string) => {
          active[role] = data.active_permissions[role] || [];
        });
        setActivePermissions(active);
      } else {
        setError('Ruxsatnomalar ro\'yxatini yuklab bo\'lmadi.');
      }
    } catch (err) {
      console.error(err);
      setError('Server bilan ulanishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPermissions();
    }
  }, [token]);

  const handleTogglePermission = (role: string, permissionKey: string) => {
    const current = activePermissions[role] || [];
    let updated: string[];

    if (current.includes(permissionKey)) {
      updated = current.filter((p) => p !== permissionKey);
    } else {
      updated = [...current, permissionKey];
    }

    setActivePermissions({
      ...activePermissions,
      [role]: updated,
    });
  };

  const handleSavePermissions = async (role: string) => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const permissions = activePermissions[role] || [];

    try {
      const res = await fetch(`${API_URL}/admin/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          role,
          permissions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`"${role}" roli ruxsatnomalari muvaffaqiyatli saqlandi!`);
        // Refresh local user context profile in case admin is modifying their own role's permissions
        refreshUser();
      } else {
        setError(data.message || 'Saqlashda xatolik yuz berdi.');
      }
    } catch (err) {
      setError('Serverga ulanish xatosi. Internet aloqasini tekshiring.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6.5 h-6.5 text-violet-400" />
          <span>Rollar huquqlari sozlamalari (Permissions Matrix)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Super Admin sifatida turli rollarga (masalan, Moderator) qaysi dashboard sahifalarini ko'rish va boshqarish huquqini berish
        </p>
      </div>

      {/* Alert logs */}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex items-center gap-2 max-w-2xl animate-fade-in">
          <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex items-center gap-2 max-w-2xl animate-fade-in">
          <Check className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-900 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : permissionsList.length > 0 ? (
            Object.keys(activePermissions).map((role) => (
              <div key={role} className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/10 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-200 capitalize">
                      {role} Roli huquqlari
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Ushbu rolga ega foydalanuvchilar kirishi mumkin bo'lgan sahifalarni tanlang
                    </p>
                  </div>

                  <button
                    onClick={() => handleSavePermissions(role)}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg hover:shadow-violet-600/10 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{submitting ? t('common.loading') : t('common.save')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissionsList.map((perm) => {
                    const isChecked = activePermissions[role]?.includes(perm.key) || false;
                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermission(role, perm.key)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-violet-500/5 border-violet-500/30 text-slate-200'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-violet-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium">{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-12 text-center text-slate-500 text-xs">
              Permissions list empty.
            </div>
          )}
        </div>

        {/* Info card info */}
        <div className="xl:col-span-1">
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/20 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Tizim qoidalari
            </h3>
            <ul className="space-y-3 text-[11px] text-slate-400 leading-relaxed list-disc pl-4">
              <li>
                <strong className="text-slate-300">Super Admin (admin)</strong> roli to'liq vakolatlarga ega va uning huquqlari xavfsizlik nuqtai nazaridan cheklanmaydi.
              </li>
              <li>
                Belgilangan huquqlar ham backend, ham frontend darajasida bir zumda kuchga kiradi.
              </li>
              <li>
                Agar foydalanuvchidan biror huquqni olib tashlasangiz va u o'sha sahifada bo'lsa, u avtomatik ravishda boshqa ruxsat berilgan sahifaga yo'naltiriladi.
              </li>
              <li>
                Tizimda ko'plab moderatorlar manhwa yuklashi uchun faqat <strong className="text-slate-300">"Manhwa va boblar boshqaruvi"</strong> hamda <strong className="text-slate-300">"Homiy hamkorlar"</strong> ruxsatnomasini berish tavsiya etiladi.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
