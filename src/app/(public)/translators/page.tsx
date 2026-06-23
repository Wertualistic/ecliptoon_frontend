'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/context/AuthContext';
import { UserRound, BookOpen, Users, ArrowRight } from 'lucide-react';

interface Translator {
  id: number;
  name: string;
  avatar_url?: string | null;
  translated_series_count: number;
  followers_count: number;
}

export default function TranslatorsDirectoryPage() {
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranslators = async () => {
      try {
        const res = await fetch(`${API_URL}/translators`);
        if (res.ok) {
          const data = await res.json();
          setTranslators(data);
        }
      } catch (err) {
        console.error('Failed to load translators', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTranslators();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500 tracking-tight">
          Tarjimonlar
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          ecliptoon platformasidagi eng yaxshi tarjimonlar va homiylar bilan tanishing. Ularning profillariga tashrif buyuring va kuzatib boring!
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl h-56 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {translators.map(translator => (
            <Link key={translator.id} href={`/translators/${translator.id}`}>
              <div className="glass-card border border-white/5 rounded-2xl p-6 shadow-xl hover:shadow-pink-500/10 hover:border-pink-500/30 transition-all group relative overflow-hidden h-full flex flex-col items-center text-center">
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Avatar */}
                <div className="relative w-24 h-24 mb-4">
                  {translator.avatar_url ? (
                    <img 
                      src={`${API_URL}/storage/${translator.avatar_url}`} 
                      alt={translator.name}
                      className="w-full h-full object-cover rounded-full ring-4 ring-slate-800 group-hover:ring-pink-500/50 transition-all shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center ring-4 ring-slate-900 group-hover:ring-pink-500/50 transition-all shadow-xl">
                      <UserRound className="w-10 h-10 text-slate-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-pink-400 transition-colors line-clamp-1 mb-1">
                  {translator.name}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-auto pt-4 w-full justify-center text-sm text-slate-400 border-t border-white/5">
                  <div className="flex items-center gap-1.5" title="Manhwalar soni">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">{translator.translated_series_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Obunachilar">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold">{translator.followers_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Banner: Become Translator */}
      <div className="mt-16 glass-card border border-pink-500/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white">Tarjimon yoki Homiy bo'lmoqchimisiz?</h3>
            <p className="text-pink-200/80">
              Bizning jamoaga qo'shiling va o'z loyihalaringizni ommaga taqdim eting!
            </p>
          </div>
          <Link href="/apply-translator" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
            Ariza topshirish
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
