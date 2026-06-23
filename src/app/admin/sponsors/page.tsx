'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Handshake, Plus, Trash2, Globe, Image as ImageIcon, AlertCircle, ShieldCheck } from 'lucide-react';

interface Sponsor {
  id: number;
  name: string;
  logo_url: string;
  link_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminSponsorsPage() {
  const { token } = useAuth();
  const { t } = useTranslation();

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [name, setName] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSponsors = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/sponsors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        setSponsors(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadSponsors();
    }
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logoFile || !token) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('logo', logoFile);
    if (linkUrl) {
      formData.append('link_url', linkUrl);
    }

    try {
      const res = await fetch(`${API_URL}/admin/sponsors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Hamkor muvaffaqiyatli qo\'shildi!');
        setName('');
        setLogoFile(null);
        setLinkUrl('');
        // Clear file input
        const fileInput = document.getElementById('sponsor-logo-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        loadSponsors();
      } else {
        setError(data.message || 'Hamkor ma\'lumotlarini saqlashda xatolik yuz berdi.');
      }
    } catch (err) {
      setError('Internet aloqasini tekshiring.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Ushbu hamkorni o\'chirishni xohlaysizmi?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/sponsors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (res.ok) {
        setSuccess('Hamkor o\'chirildi.');
        loadSponsors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Handshake className="w-6.5 h-6.5 text-violet-400" />
            <span>Homiylar va Hamkorlar boshqaruvi (Sponsors)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bosh sahifada avtomatik aylanadigan homiylarning logotiplarini va veb-sayt havolalarini boshqarish
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Create Form */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-2">
            <Plus className="w-4.5 h-4.5 text-violet-400" />
            <span>{t('adminPanel.addSponsor')}</span>
          </h3>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Hamkor/Homiy nomi (Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="masalan: Payme / Click / Telegram Kanal"
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Logotip rasmi (Logo File - max 2MB)
              </label>
              <div className="relative">
                <input
                  id="sponsor-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-slate-950 border border-white/10 text-slate-400 text-xs px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  required
                />
                <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Hamkor sayti havolasi (Website Link - Ixtiyoriy)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm pl-4 pr-10 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                />
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? t('common.loading') : 'Qo\'shish'}</span>
              <Handshake className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Sponsors list */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2">
            Homiylar ro'yxati
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-900/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : sponsors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sponsors.map((s) => (
                <div 
                  key={s.id} 
                  className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-20 h-10 p-1.5 bg-slate-900/80 border border-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <img
                        src={s.logo_url}
                        alt={s.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-200 text-sm truncate">{s.name}</h4>
                      {s.link_url ? (
                        <a 
                          href={s.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5 truncate"
                        >
                          <Globe className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{s.link_url}</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Havola yo'q</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Homiylar ro'yxati bo'sh.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
