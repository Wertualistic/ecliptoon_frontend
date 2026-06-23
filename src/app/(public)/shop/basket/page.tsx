'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft, Send, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface CartItem {
  id: number;
  title: string;
  price: number;
  cover_url: string | null;
  quantity: number;
  stock: number;
}

export default function ShoppingBasketPage() {
  const { t } = useTranslation();
  const { token, isAuthenticated, user, refreshUser } = useAuth();
  const { cart, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  const [ordering, setOrdering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderData, setSuccessOrderData] = useState<{ id: number; total: number; telegramUrl: string } | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Countdown timer for automatic redirect
  useEffect(() => {
    if (!showSuccessModal || !successOrderData) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = successOrderData.telegramUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSuccessModal, successOrderData]);

  const handleQuantityChange = async (item: any, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    
    // local stock check if book object is available
    if (item.book && newQty > item.book.stock) {
      alert(`Kechirasiz, ushbu kitob uchun zaxira chegarasidan oshib bo'lmaydi (Maksimal: ${item.book.stock})`);
      return;
    } else if (item.stock && newQty > item.stock) { // local guest cart structure
      alert(`Kechirasiz, ushbu kitob uchun zaxira chegarasidan oshib bo'lmaydi (Maksimal: ${item.stock})`);
      return;
    }

    await updateQuantity(item.book_id, newQty, typeof item.id === 'number' ? item.id : undefined);
  };

  const handleRemoveItem = async (item: any) => {
    await removeFromCart(item.book_id, typeof item.id === 'number' ? item.id : undefined);
  };

  const totalCost = cart.reduce((sum, item) => {
    const price = item.book ? item.book.price : (item as any).price || 0;
    return sum + price * item.quantity;
  }, 0);
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (cart.length === 0 || ordering) return;

    if (user && user.diamond_balance < totalCost) {
      setErrorMessage(`Kechirasiz, balansingiz yetarli emas! Jami: ${totalCost} Olmos. Sizning balansingiz: ${user.diamond_balance} Olmos.`);
      return;
    }

    setOrdering(true);
    setErrorMessage(null);

    try {
      const orderItems = cart.map((item) => ({
        book_id: item.book_id,
        quantity: item.quantity,
      }));

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: orderItems }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Buyurtma berishda xatolik yuz berdi.');
        return;
      }

      // Clear basket locally and DB
      await clearCart();

      // Refresh User context to sync balance
      await refreshUser();

      // Show success modal and trigger countdown
      setSuccessOrderData({
        id: data.order_id,
        total: data.total_price,
        telegramUrl: data.telegram_url || 'https://t.me/yourtoxa'
      });
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage('Internet aloqasini tekshiring.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pb-20 pt-10 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Do'konga qaytish</span>
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-violet-400" />
          <span>{t('basket.title')}</span>
        </h1>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Basket Items Table */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-slate-900/40 border border-white/5 hover:border-white/10 rounded-2xl transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-28 bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                    {(item.book ? item.book.cover_url : (item as any).cover_url) ? (
                      <img
                        src={item.book ? item.book.cover_url : (item as any).cover_url!}
                        alt={item.book ? item.book.title : (item as any).title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <ShoppingBag className="w-6 h-6 opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* Info & Adjusts */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-200 line-clamp-1">{item.book ? item.book.title : (item as any).title}</h3>
                        <p className="text-[10px] text-slate-500 uppercase mt-0.5 font-bold">Narxi: {item.book ? item.book.price : (item as any).price} <StrawberryIcon /></p>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800/40 transition-all cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Adjust triggers */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center bg-slate-950/60 border border-white/5 rounded-xl p-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-200">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          disabled={item.quantity >= (item.book ? item.book.stock : (item as any).stock)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="font-extrabold text-amber-400 text-xs bg-slate-950/40 border border-white/5 px-3 py-1.5 rounded-xl">
                        Jami: {(item.book ? item.book.price : (item as any).price) * item.quantity} <StrawberryIcon />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Checkout Card */}
            <div className="space-y-6">
              <div className="p-6 glass-card border border-white/5 rounded-2xl space-y-6">
                <h2 className="text-lg font-bold text-slate-200 border-b border-white/5 pb-4">
                  Buyurtma hisobi
                </h2>

                <div className="space-y-4 text-xs font-semibold text-slate-400">
                  <div className="flex justify-between">
                    <span>Kitoblar soni</span>
                    <span className="text-slate-200">{totalItems} ta</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Sizning balansingiz</span>
                    <span className="text-slate-200">
                      {isAuthenticated && user ? <span className="flex items-center gap-1">{user.diamond_balance} <StrawberryIcon /></span> : <span className="flex items-center gap-1">0 <StrawberryIcon /></span>}
                    </span>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex justify-between items-center text-sm font-extrabold">
                    <span className="text-slate-300">{t('basket.total')}</span>
                    <span className="text-amber-400 text-lg flex items-center gap-1">
                      {totalCost} <StrawberryIcon />
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl leading-relaxed">
                    {errorMessage}
                  </p>
                )}

                <div className="pt-2">
                  {isAuthenticated ? (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={ordering || cart.length === 0}
                      className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-white/5 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      {ordering ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{t('basket.orderBtn')}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white text-center font-extrabold text-sm rounded-xl transition-all"
                    >
                      Tizimga kirish
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto py-20 text-center space-y-6 glass-card border border-white/5 rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-slate-300 text-sm font-extrabold">{t('basket.empty')}</p>
              <p className="text-slate-500 text-xs">Savatga sevimli kitoblaringizni qo'shib xarid qiling.</p>
            </div>
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
            >
              Do'konga o'tish
            </Link>
          </div>
        )}
      </div>

      {/* Checkout Success Modal */}
      {showSuccessModal && successOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-8 glass-card border border-emerald-500/20 rounded-2xl text-center space-y-6 shadow-2xl shadow-emerald-500/5">
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 shadow-lg shadow-emerald-500/5 animate-pulse-glow">
                <Check className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">To'lov muvaffaqiyatli amalga oshirildi! <StrawberryIcon /></h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Sizning buyurtmangiz rasmiylashtirildi va olmoslar balansingizdan muvaffaqiyatli yechib olindi.
              </p>
            </div>

            {/* Summary Details */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 text-xs font-semibold text-slate-300 space-y-2.5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyurtma ID:</span>
                <span className="text-slate-200 font-bold">#{successOrderData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Yechilgan miqdor:</span>
                <span className="text-amber-400 font-extrabold">{successOrderData.total} <StrawberryIcon /></span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Yangi balansingiz:</span>
                <span className="text-slate-200 font-bold">
                  {user ? <span className="flex items-center gap-1">{user.diamond_balance} <StrawberryIcon /></span> : <span className="flex items-center gap-1">0 <StrawberryIcon /></span>}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 font-medium">
                Tasdiqlash uchun {countdown} soniyadan so'ng Telegram orqali admin bilan bog'lanish sahifasiga yo'naltirilasiz...
              </p>

              <button
                onClick={() => {
                  window.location.href = successOrderData.telegramUrl;
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 rounded-xl font-extrabold text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>Telegramga o'tish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
