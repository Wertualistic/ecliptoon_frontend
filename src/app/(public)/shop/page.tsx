'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, AlertCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface Book {
  id: number;
  title: string;
  description: string | null;
  price: number;
  cover_url: string | null;
  stock: number;
  created_at: string;
}

interface CartItem {
  id: number;
  title: string;
  price: number;
  cover_url: string | null;
  quantity: number;
  stock: number;
}

export default function PublicShopPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { addToCart, cart } = useCart();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/books`);
      if (res.ok) {
        setBooks(await res.json());
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBasket = async (book: Book) => {
    try {
      // Find existing item quantity from context cart state
      const existingItem = cart.find((item) => item.book_id === book.id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      
      if (currentQty >= book.stock) {
        alert(`Kechirasiz, zaxiradagi barcha kitoblarni savatga qo'shib bo'ldingiz (Maksimal: ${book.stock})`);
        return;
      }
      
      await addToCart(book, 1);

      // Show temporary notification
      setNotification(`"${book.title}" savatga qo'shildi!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error adding to basket:', err);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pb-20 animate-fade-in">
      {/* 1. Header Hero section */}
      <section className="relative overflow-hidden py-16 px-4 text-center bg-gradient-to-b from-violet-950/20 via-slate-950/50 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),transparent_60%)]"></div>
        <div className="relative max-w-4xl mx-auto space-y-4">
          <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-xs font-semibold tracking-wider uppercase">
            Platforma do'koni <StrawberryIcon />
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
            {t('shop.title')}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            ecliptoon do'konida sevimli kitoblaringizni to'g'ridan-to'g'ri olmos (<StrawberryIcon />) evaziga xarid qiling. Savatga qo'shing va buyurtma bering!
          </p>
        </div>
      </section>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-500/30 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-in">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-sm">{t('common.loading')}</p>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group relative flex flex-col bg-slate-900/40 border border-white/5 hover:border-violet-500/20 rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-violet-900/5"
              >
                {/* Book Cover */}
                <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                      <ShoppingBag className="w-10 h-10 mb-2 opacity-30" />
                      <span>Muqova yo'q</span>
                    </div>
                  )}

                  {/* Stock tag */}
                  {book.stock <= 0 ? (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      {t('shop.outOfStock')}
                    </div>
                  ) : book.stock <= 3 ? (
                    <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      Soni kam ({book.stock})
                    </div>
                  ) : null}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {book.description || 'Kitob haqida qo\'shimcha ma\'lumot yuklanmagan.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Price & Balance */}
                    <div className="flex justify-between items-center bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Narxi</span>
                      <span className="font-extrabold text-amber-400 text-sm flex items-center gap-1">
                        {book.price} <StrawberryIcon />
                      </span>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleAddToBasket(book)}
                      disabled={book.stock <= 0}
                      className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-white/5 border border-violet-500/20 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      {book.stock <= 0 ? t('shop.outOfStock') : t('shop.addToBasket')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto py-20 text-center space-y-4 glass-card border border-white/5 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-semibold">{t('shop.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
