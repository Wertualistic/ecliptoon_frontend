<<<<<<< HEAD
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar } from 'lucide-react';
import { API_URL } from '@/context/AuthContext';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_URL}/news`);
        if (res.ok) {
          const data = await res.json();
          setNewsList(data);
        }
      } catch (error) {
        console.error('Failed to fetch news', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Newspaper className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Yangiliklar</h1>
      </div>

      <div className="space-y-6">
        {newsList.length === 0 ? (
          <p className="text-slate-400">Hozircha yangiliklar yo'q.</p>
        ) : (
          newsList.map((news) => (
            <Link href={`/news/${news.id}`} key={news.id}>
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300 flex flex-col md:flex-row group mb-6">
                {news.image_url && (
                  <div className="md:w-64 h-48 md:h-auto shrink-0 overflow-hidden">
                    <img 
                      src={`${API_URL.replace(/\/api$/, '')}/storage/${news.image_url}`} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(news.created_at).toLocaleDateString('uz-UZ')}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h2>
                  <p className="text-slate-300 line-clamp-3">
                    {news.content}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
=======
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar } from 'lucide-react';
import { API_URL } from '@/context/AuthContext';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_URL}/news`);
        if (res.ok) {
          const data = await res.json();
          setNewsList(data);
        }
      } catch (error) {
        console.error('Failed to fetch news', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Newspaper className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Yangiliklar</h1>
      </div>

      <div className="space-y-6">
        {newsList.length === 0 ? (
          <p className="text-slate-400">Hozircha yangiliklar yo'q.</p>
        ) : (
          newsList.map((news) => (
            <Link href={`/news/${news.id}`} key={news.id}>
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300 flex flex-col md:flex-row group mb-6">
                {news.image_url && (
                  <div className="md:w-64 h-48 md:h-auto shrink-0 overflow-hidden">
                    <img 
                      src={`${API_URL.replace(/\/api$/, '')}/storage/${news.image_url}`} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(news.created_at).toLocaleDateString('uz-UZ')}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h2>
                  <p className="text-slate-300 line-clamp-3">
                    {news.content}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
>>>>>>> origin
