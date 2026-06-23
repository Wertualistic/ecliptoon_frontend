'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Plus, Edit, Trash2, X, Upload, ShoppingBag } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface Book {
  id: number;
  title: string;
  description: string | null;
  price: number;
  cover_url: string | null;
  cover_path: string | null;
  stock: number;
  created_at: string;
}

export default function AdminBooksPage() {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [token]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/books`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        setBooks(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (book: Book | null = null) => {
    setSelectedBook(book);
    if (book) {
      setTitle(book.title);
      setDescription(book.description || '');
      setPrice(book.price.toString());
      setStock(book.stock.toString());
      setCoverPreview(book.cover_url);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setStock('');
      setCoverPreview(null);
    }
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Fayl hajmi 5MB dan oshmasligi lozim.");
      return;
    }

    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting || !token) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      const url = selectedBook 
        ? `${API_URL}/admin/books/${selectedBook.id}` 
        : `${API_URL}/admin/books`;

      // Laravel updates via POST to handle multipart data properly
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        fetchBooks();
        handleCloseModal();
      } else {
        alert(data.message || 'Xatolik yuz berdi.');
      }
    } catch (err) {
      alert('Tizim xatosi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ushbu kitobni do\'kondan o\'chirishni xohlaysizmi?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        setBooks(prev => prev.filter(b => b.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'O\'chirishda xatolik yuz berdi.');
      }
    } catch (err) {
      alert('Tizim xatosi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Kitoblar do'koni CRUD</h1>
          <p className="text-slate-400 text-xs mt-1">Platforma do'konidagi kitoblar ro'yxati va ularni tahrirlash</p>
        </div>

        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi kitob qo'shish</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-xs">{t('common.loading')}</p>
        </div>
      ) : books.length > 0 ? (
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-bold bg-slate-950/20 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16">Muqova</th>
                  <th className="py-4 px-6">Sarlavha</th>
                  <th className="py-4 px-6">Tavsif</th>
                  <th className="py-4 px-6 w-32">Narxi</th>
                  <th className="py-4 px-6 w-24">Zaxira (Stock)</th>
                  <th className="py-4 px-6 w-28 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-900/10 transition-colors font-medium text-slate-300">
                    <td className="py-4 px-6">
                      <div className="w-10 h-14 bg-slate-950 rounded-lg overflow-hidden border border-white/5">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-700">
                            <ShoppingBag className="w-5 h-5 opacity-40" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-200">{book.title}</td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-400">{book.description || '-'}</td>
                    <td className="py-4 px-6 text-amber-400 font-extrabold">{book.price} <StrawberryIcon /></td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${book.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {book.stock} ta
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(book)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500 text-xs border border-white/5 bg-slate-900/10 rounded-2xl">
          Hozircha kitoblar mavjud emas. Yangi kitob qo'shing.
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="font-extrabold text-slate-100 text-base">
                {selectedBook ? 'Kitobni tahrirlash' : 'Yangi kitob qo\'shish'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-semibold">Kitob nomi</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Solo Leveling Vol 1"
                  className="w-full bg-slate-950 border border-white/10 text-xs text-slate-200 p-3 rounded-xl outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-semibold">Tavsif (Description)</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kitob haqida batafsil..."
                  className="w-full bg-slate-950 border border-white/10 text-xs text-slate-200 p-3 rounded-xl outline-none focus:border-violet-500 resize-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">Narxi (Olmos <StrawberryIcon />)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Narxi"
                    className="w-full bg-slate-950 border border-white/10 text-xs text-slate-200 p-3 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">Zaxira soni (Stock)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Soni"
                    className="w-full bg-slate-950 border border-white/10 text-xs text-slate-200 p-3 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* Cover File Upload */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-semibold block">Muqova rasmi</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-violet-400" />
                    <span>Rasm tanlash</span>
                  </button>

                  <span className="text-[10px] text-slate-500">Maks: 5MB (JPG/PNG)</span>
                </div>

                {coverPreview && (
                  <div className="relative inline-block w-20 h-28 bg-slate-950 rounded-xl overflow-hidden border border-white/10 mt-2">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPreview(null);
                        setCoverFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-1 right-1 p-1 bg-slate-950/80 border border-white/10 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-800 disabled:text-slate-500 border border-violet-500/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting ? 'Yuklanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
