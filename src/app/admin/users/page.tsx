'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Users, Search, Ban, ShieldAlert, Award, Coins, AlertCircle } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator' | 'translator';
  diamond_balance: number;
  is_banned: boolean;
  instagram_url?: string;
  telegram_url?: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { t } = useTranslation();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  
  // Selected user for editing
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('user');
  const [isBanned, setIsBanned] = useState<boolean>(false);
  const [balanceAdjust, setBalanceAdjust] = useState<string>('0');
  const [instagramUrl, setInstagramUrl] = useState<string>('');
  const [telegramUrl, setTelegramUrl] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setRole(user.role);
    setIsBanned(user.is_banned);
    setBalanceAdjust('0');
    setInstagramUrl(user.instagram_url || '');
    setTelegramUrl(user.telegram_url || '');
    setError(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !token) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          role,
          is_banned: isBanned,
          adjust_balance: Number(balanceAdjust) || 0,
          instagram_url: instagramUrl,
          telegram_url: telegramUrl,
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSelectedUser(null);
        loadUsers();
      } else {
        setError(data.message || 'Xatolik yuz berdi.');
      }
    } catch (err) {
      setError('Internet aloqasini tekshiring.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter list by search locally
  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
  });

  const getRoleColor = (r: string) => {
    switch (r) {
      case 'admin': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'moderator': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-300 bg-slate-800 border-white/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-6.5 h-6.5 text-red-400" />
            <span>Foydalanuvchilar (Users)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Platforma a'zolarini bloklash, rolarini o'zgartirish va balanslarini boshqarish
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Ism yoki email bo'yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Table List */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-900/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Foydalanuvchi</th>
                    <th className="pb-3 px-4">Rol</th>
                    <th className="pb-3 px-4">Balans</th>
                    <th className="pb-3 px-4">Holat</th>
                    <th className="pb-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr 
                      key={u.id} 
                      className={`border-b border-white/5 text-slate-300 hover:bg-slate-900/30 transition-colors ${
                        u.is_banned ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="py-3.5 pr-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-200 block">{u.name}</span>
                          <span className="text-[10px] text-slate-500 block">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide ${getRoleColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        {u.diamond_balance} <StrawberryIcon />
                      </td>
                      <td className="py-3.5 px-4">
                        {u.is_banned ? (
                          <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                            <Ban className="w-3.5 h-3.5 text-red-500" />
                            <span>Bloklangan</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold">Faol</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSelectUser(u)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Tahrirlash
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Foydalanuvchilar topilmadi.
            </div>
          )}
        </div>

        {/* Right: Selected User Edit form */}
        <div className="lg:col-span-1">
          {selectedUser ? (
            <div className="glass-card p-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-6">
              <div className="flex justify-between items-start border-b border-violet-500/10 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Foydalanuvchi sozlamalari
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedUser.name}</p>
                </div>
                
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Yopish
                </button>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleUpdateUser} className="space-y-4">
                {/* Role dropdown */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                    <Award className="w-4 h-4 text-violet-400" />
                    <span>{t('adminPanel.changeRole')}</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="translator">Translator</option>
                  </select>
                </div>

                {/* Banning toggle */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                    <Ban className="w-4 h-4 text-violet-400" />
                    <span>{t('adminPanel.banUser')}</span>
                  </label>
                  <select
                    value={isBanned ? 'true' : 'false'}
                    onChange={(e) => setIsBanned(e.target.value === 'true')}
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                  >
                    <option value="false">Faol (Yo'q)</option>
                    <option value="true">Bloklangan (Ha)</option>
                  </select>
                </div>

                {role === 'translator' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                        Instagram URL
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: https://instagram.com/user"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2.5 rounded-xl outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                        Telegram URL
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: https://t.me/user"
                        value={telegramUrl}
                        onChange={(e) => setTelegramUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2.5 rounded-xl outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Balance adjust input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold flex items-center justify-between uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-violet-400" />
                      <span>{t('adminPanel.adjustBalance')}</span>
                    </div>
                    <span className="text-[10px] text-amber-400">Joriy: {selectedUser.diamond_balance} <StrawberryIcon /></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: +50 yoki -20"
                    value={balanceAdjust}
                    onChange={(e) => setBalanceAdjust(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2.5 rounded-xl outline-none font-bold font-mono"
                  />
                  <p className="text-[9px] text-slate-500">
                    Kiritilgan miqdor joriy balansga qo'shiladi yoki ayiriladi.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {submitting ? t('common.loading') : t('common.save')}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl border border-white/5 text-center text-slate-500 text-xs">
              <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              Tahrirlash uchun ro'yxatdan biror foydalanuvchini tanlang.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

