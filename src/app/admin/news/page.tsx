'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, Newspaper } from 'lucide-react';
import { API_URL } from '@/context/AuthContext';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function AdminNewsPage() {
  const { token } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [token]);

  const fetchNews = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/news`);
      if (res.ok) {
        setNews(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openNewForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImageFile(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: NewsItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    // We defined Route::post for update to handle multipart data, so no need for _method=PUT
    try {
      const url = editingId ? `${API_URL}/admin/news/${editingId}` : `${API_URL}/admin/news`;
      const method = 'POST'; // Since we are using FormData with file upload

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        closeForm();
        fetchNews();
      } else {
        alert('Xatolik yuz berdi');
      }
    } catch (e) {
      console.error(e);
      alert('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Rostdan ham ushbu yangilikni o\'chirmoqchimisiz?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 border border-white/5 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper className="text-blue-400" />
            Yangiliklar
          </h1>
          <p className="text-sm text-slate-400 mt-1">Platformadagi barcha yangiliklarni boshqarish</p>
        </div>
        
        {!isFormOpen && (
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Yangilik Qo'shish
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-slate-900/80 border border-blue-500/30 p-6 rounded-2xl mb-8">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white">
              {editingId ? 'Yangilikni Tahrirlash' : 'Yangi Yangilik Qo\'shish'}
            </h2>
            <button onClick={closeForm} className="text-slate-400 hover:text-white p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Sarlavha</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="Yangilik sarlavhasi..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Matn</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-40"
                placeholder="Yangilik matni..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Muqova Rasmi</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer transition-colors border border-white/10">
                  <ImageIcon className="w-5 h-5" />
                  Rasm Tanlash
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                {imageFile && <span className="text-sm text-blue-400 font-medium">{imageFile.name}</span>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={closeForm}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-colors">
              {item.image_url ? (
                <div className="h-48 overflow-hidden bg-slate-800">
                  <img src={`${API_URL.replace('/api', '')}/storage/${item.image_url}`} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-slate-800/50 flex items-center justify-center">
                  <Newspaper className="w-12 h-12 text-slate-600" />
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs text-slate-500 mb-2">{new Date(item.created_at).toLocaleDateString('uz-UZ')}</div>
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">{item.content}</p>
                
                <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                  <button
                    onClick={() => openEditForm(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-950/50 hover:bg-red-900/50 text-red-400 text-sm font-semibold rounded-lg transition-colors border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
          {news.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5">
              Hozircha yangiliklar yo'q
            </div>
          )}
        </div>
      )}
    </div>
  );
}
