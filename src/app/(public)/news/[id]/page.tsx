'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '@/context/AuthContext';
import { Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_URL}/news/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch (error) {
        console.error('Failed to fetch news details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Yangilik topilmadi</h1>
        <Link href="/news" className="text-violet-400 hover:text-violet-300">Ortga qaytish</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/news" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Yangiliklarga qaytish
      </Link>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <Calendar className="w-4 h-4" />
          {new Date(news.created_at).toLocaleDateString('uz-UZ')}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
          {news.title}
        </h1>

        {news.image_url && (
          <div className="w-full rounded-xl overflow-hidden mb-8 max-h-[500px]">
            <img 
              src={`${API_URL.replace(/\/api$/, '')}/storage/${news.image_url}`} 
              alt={news.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-invert prose-violet max-w-none">
          {news.content.split('\n').map((paragraph: string, idx: number) => (
            <p key={idx} className="text-slate-300 leading-relaxed mb-4 text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
