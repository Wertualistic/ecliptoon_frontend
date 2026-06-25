'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '@/context/AuthContext';
import { Camera, Send, UserRound, ArrowLeft, Users, UserPlus, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { SeriesCard } from '@/components/SeriesCard';

export default function TranslatorProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [translator, setTranslator] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTranslator = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}/translators/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setTranslator(data.translator);
          setIsFollowing(data.is_following);
        }
      } catch (error) {
        console.error('Failed to fetch translator details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTranslator();
  }, [id]);

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert("Obuna bo'lish uchun tizimga kiring.");
      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(`${API_URL}/translators/${id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.is_following);
        setTranslator((prev: any) => ({
          ...prev,
          followers_count: data.is_following ? prev.followers_count + 1 : prev.followers_count - 1
        }));
      } else {
        alert(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Follow request failed', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!translator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Tarjimon topilmadi</h1>
        <Link href="/catalog" className="text-violet-400 hover:text-violet-300">Katalogga qaytish</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/catalog" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Katalogga qaytish
      </Link>

      {/* Translator Profile Header */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-10 mb-12 flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-slate-800 border-4 border-violet-500/20 shrink-0">
          {translator.avatar_url ? (
            <img src={`${API_URL.replace(/\/api$/, '')}/storage/${translator.avatar_url}`} alt={translator.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-violet-500/10">
              <UserRound className="w-16 h-16 text-violet-400" />
            </div>
          )}
        </div>
        
        <div className="text-center md:text-left flex-1">
          <div className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-semibold mb-3">
            Rasmiy Tarjimon
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{translator.name}</h1>
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            {translator.instagram_url && (
              <a href={translator.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-pink-500 to-orange-400 text-white rounded-xl hover:scale-105 transition-transform font-medium">
                <Camera className="w-5 h-5" />
                Instagram
              </a>
            )}
            {translator.telegram_url && (
              <a href={translator.telegram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded-xl hover:scale-105 transition-transform font-medium">
                <Send className="w-5 h-5" />
                Telegram
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-4 min-w-[150px]">
          <div className="bg-slate-800/50 rounded-2xl p-4 text-center flex-1 border border-white/5 shadow-inner">
            <div className="text-2xl font-black text-white mb-1">{translator.translated_series?.length || 0}</div>
            <div className="text-xs text-slate-400 font-medium">Loyiha</div>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-4 text-center flex-1 border border-white/5 shadow-inner">
            <div className="text-2xl font-black text-white mb-1">{translator.followers_count || 0}</div>
            <div className="text-xs text-slate-400 font-medium">Obunachi</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center md:justify-end -mt-8 mb-12 px-8">
        <button 
          onClick={handleFollowToggle}
          disabled={followLoading}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100
            ${isFollowing 
              ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' 
              : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600'
            }`}
        >
          {followLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : isFollowing ? (
            <>
              <UserMinus className="w-5 h-5" />
              Obunani bekor qilish
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Obuna bo'lish
            </>
          )}
        </button>
      </div>

      {/* Translated Series Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          Tarjimonning loyihalari
        </h2>
      </div>

      {translator.translated_series && translator.translated_series.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {translator.translated_series.map((series: any) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-white/5">
          <p className="text-slate-400 text-lg">Hozircha loyihalar yuklanmagan.</p>
        </div>
      )}
    </div>
  );
}
