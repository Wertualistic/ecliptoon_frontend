'use client';

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Trophy, Coins, BookOpen, Flame, Award, Crown } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface LeaderboardUser {
  id: number;
  name: string;
  avatar_url: string | null;
  score: number;
}

interface LeaderboardData {
  top_readers: LeaderboardUser[];
  top_buyers: LeaderboardUser[];
}

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<LeaderboardData>({ top_readers: [], top_buyers: [] });
  const [activeTab, setActiveTab] = useState<'readers' | 'buyers'>('readers');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/leaderboard`);
        if (!res.ok) {
          throw new Error('Reyting ma\'lumotlarini yuklab bo\'lmadi.');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message || 'Xatolik yuz berdi.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarGradient = (userId: number) => {
    const gradients = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-fuchsia-500 to-violet-500'
    ];
    return gradients[userId % gradients.length];
  };

  const activeList = activeTab === 'readers' ? data.top_readers : data.top_buyers;

  // Split list into podium (top 3) and standard list (ranks 4-10)
  const podiumList = activeList.slice(0, 3);
  const listItems = activeList.slice(3);

  // Reorder podium: index 1 (2nd place), index 0 (1st place), index 2 (3rd place)
  // this is for layout display left-to-right (2nd - 1st - 3rd)
  const orderedPodium = [];
  if (podiumList[1]) orderedPodium.push({ ...podiumList[1], rank: 2 });
  if (podiumList[0]) orderedPodium.push({ ...podiumList[0], rank: 1 });
  if (podiumList[2]) orderedPodium.push({ ...podiumList[2], rank: 3 });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-pulse">
        <div className="text-center space-y-3">
          <div className="h-8 w-48 bg-slate-900 rounded mx-auto"></div>
          <div className="h-4 w-72 bg-slate-900 rounded mx-auto"></div>
        </div>
        <div className="flex justify-center gap-4">
          <div className="h-10 w-44 bg-slate-900 rounded-xl"></div>
          <div className="h-10 w-44 bg-slate-900 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 items-end h-64 max-w-lg mx-auto pt-8">
          <div className="h-32 bg-slate-900/60 rounded-t-2xl"></div>
          <div className="h-48 bg-slate-900/60 rounded-t-2xl"></div>
          <div className="h-24 bg-slate-900/60 rounded-t-2xl"></div>
        </div>
        <div className="space-y-3 max-w-2xl mx-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-900/40 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          <span>{t('leaderboard.title')}</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          {activeTab === 'readers' ? t('leaderboard.readersDesc') : t('leaderboard.buyersDesc')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-slate-900/80 p-1 border border-white/5 rounded-2xl shadow-xl">
          <button
            onClick={() => setActiveTab('readers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'readers'
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span>{t('leaderboard.topReaders')}</span>
          </button>
          <button
            onClick={() => setActiveTab('buyers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4.5 h-4.5" />
            <span>{t('leaderboard.topBuyers')}</span>
          </button>
        </div>
      </div>

      {activeList.length > 0 ? (
        <div className="space-y-12">
          
          {/* Podium (Top 3 Users) */}
          {podiumList.length > 0 && (
            <div className="flex flex-row justify-center items-end gap-2 sm:gap-6 pt-16 pb-6 max-w-lg mx-auto border-b border-white/5">
              {orderedPodium.map((user) => {
                const isFirst = user.rank === 1;
                const isSecond = user.rank === 2;
                const isThird = user.rank === 3;

                return (
                  <div
                    key={user.id}
                    className={`flex flex-col items-center flex-1 transition-all duration-500 hover:scale-105 ${
                      isFirst ? 'z-20 -translate-y-4' : 'z-10'
                    }`}
                  >
                    {/* Avatar with Ring */}
                    <div className="relative mb-2">
                      {isFirst && (
                        <Crown className="w-7 h-7 text-amber-400 fill-amber-400 absolute -top-5.5 left-1/2 -translate-x-1/2 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse" />
                      )}
                      
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-extrabold text-lg sm:text-xl border-2 shadow-2xl overflow-hidden ${
                        isFirst ? 'border-amber-400 ring-4 ring-amber-500/15' :
                        isSecond ? 'border-slate-300' : 'border-amber-700'
                      }`}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getAvatarGradient(user.id)} flex items-center justify-center text-slate-100`}>
                            {getInitials(user.name)}
                          </div>
                        )}
                      </div>

                      {/* Rank Tag */}
                      <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center w-5.5 h-5.5 rounded-full text-xs font-black text-slate-950 border border-slate-950 shadow-md ${
                        isFirst ? 'bg-amber-400' :
                        isSecond ? 'bg-slate-300' : 'bg-amber-700 text-amber-50'
                      }`}>
                        {user.rank}
                      </span>
                    </div>

                    {/* Username */}
                    <div className="text-center mt-2 max-w-[90px] sm:max-w-[120px]">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                        {user.name}
                      </h3>
                      
                      {/* Score Badge */}
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-violet-400 mt-1">
                        {activeTab === 'readers' ? (
                          <>
                            <Flame className="w-3.5 h-3.5 text-rose-500" />
                            <span>{user.score} bob</span>
                          </>
                        ) : (
                          <>
                            <span>{user.score.toLocaleString()}</span>
                            <span className="text-[10px]"><StrawberryIcon /></span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Column Podiums */}
                    <div className={`w-full mt-4 bg-slate-900/40 border-t border-white/5 rounded-t-2xl flex items-center justify-center ${
                      isFirst ? 'h-24 sm:h-28 bg-amber-500/5 border-amber-500/10' :
                      isSecond ? 'h-16 sm:h-20 bg-slate-100/5' :
                      'h-12 sm:h-16 bg-amber-800/5'
                    }`}>
                      <Award className={`w-5 h-5 ${
                        isFirst ? 'text-amber-400' :
                        isSecond ? 'text-slate-300' :
                        'text-amber-700'
                      }`} />
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* List Table (Ranks 4-10) */}
          {listItems.length > 0 && (
            <div className="max-w-2xl mx-auto space-y-2">
              {listItems.map((user, idx) => {
                const rank = idx + 4;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-violet-500/20 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <span className="w-6 font-extrabold text-slate-500 text-xs sm:text-sm text-center group-hover:text-violet-400 transition-colors">
                        #{rank}
                      </span>

                      {/* Avatar */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm overflow-hidden border border-white/10">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getAvatarGradient(user.id)} flex items-center justify-center text-slate-100`}>
                            {getInitials(user.name)}
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <span className="font-bold text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                        {user.name}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1">
                      {activeTab === 'readers' ? (
                        <span className="text-xs sm:text-sm font-extrabold text-slate-400 group-hover:text-rose-400 transition-colors flex items-center gap-1">
                          <Flame className="w-4 h-4 text-rose-500" />
                          <span>{user.score} {t('common.chapter').toLowerCase()}</span>
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm font-extrabold text-slate-400 group-hover:text-amber-400 transition-colors flex items-center gap-1">
                          <span>{user.score.toLocaleString()}</span>
                          <span className="text-xs"><StrawberryIcon /></span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* Empty/No Data display */
        <div className="glass-card p-12 rounded-2xl border border-white/5 text-center text-slate-400 max-w-md mx-auto">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium">{t('leaderboard.empty')}</p>
        </div>
      )}
    </div>
  );
}

