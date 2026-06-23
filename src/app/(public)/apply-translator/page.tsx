'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import { API_URL } from '@/context/AuthContext';

export default function ApplyTranslatorPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already translator or admin
  if (user && (user.role === 'translator' || user.role === 'admin')) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4 py-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Siz allaqachon tarjimonsiz!</h1>
        <p className="text-slate-400">Sizning hisobingiz tarjimon yoki admin huquqlariga ega.</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Shaxsiy kabinetga qaytish
        </button>
      </div>
    );
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Iltimos, shartlarga rozilik bildiring.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/translators/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      setError(err.message || 'Tarmoq xatosi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4 py-8 text-center space-y-4 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-4 border border-emerald-500/20">
          <FileText className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Arizangiz qabul qilindi!</h1>
        <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
          Sizning arizangiz ma'muriyatga yuborildi. Tez orada ko'rib chiqiladi. Iltimos kuting.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4 py-8 animate-fade-in">
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500 tracking-tight">
          Tarjimon / Homiy bo'lish
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          O'z loyihalaringizni yuklash va saytda tarjimon sifatida faoliyat yuritish uchun quyidagi qoidalar bilan tanishib chiqing.
        </p>
      </div>

      <div className="glass-card border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5 md:p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-200 border-b border-white/10 pb-3">Homiylik va Tarjimonlik qoidalari</h3>
            
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
              <p>1. Homiylik akkaunti faqat bitta foydalanuvchi uchun mo‘ljallangan.</p>
              <p>2. Login va parolni boshqa shaxsga berish, ulashish, sotish yoki ijaraga berish qat'iyan taqiqlanadi.</p>
              <p>3. Bir akkauntdan bir nechta shaxs foydalanayotgani aniqlansa, akkaunt ogohlantirishsiz cheklanishi yoki bloklanishi mumkin.</p>
              <p>4. Homiy akkaunti egasi joylashtirgan barcha materiallar uchun shaxsan javobgar hisoblanadi.</p>
              <p>5. Spam, soxta ma'lumot, zararli havolalar yoki sayt faoliyatiga zarar yetkazuvchi harakatlar taqiqlanadi.</p>
              <p>6. Boshqa foydalanuvchilarning akkauntlariga ruxsatsiz kirishga urinish qat'iyan taqiqlanadi.</p>
              <p>7. Akkauntni sotish, topshirish yoki boshqa shaxs nomiga o‘tkazish mumkin emas.</p>
              <p>8. Login ma'lumotlarining xavfsizligini ta'minlash akkaunt egasining zimmasidadir.</p>
              <p>9. Qoidalarni buzgan foydalanuvchilar ogohlantirishsiz vaqtinchalik yoki doimiy bloklanishi mumkin.</p>
              <p>10. Homiy akkaunti orqali faqat akkaunt egasining o‘zi material joylashtirishi mumkin.</p>
              <p>11. Akkauntdan noqonuniy, haqoratomuz yoki zararli kontent joylashtirish taqiqlanadi.</p>
              <p>12. Sayt ma'muriyati istalgan vaqtda akkaunt faoliyatini tekshirish huquqiga ega.</p>
              <p>13. Tizim xavfsizligiga tahdid soluvchi har qanday faoliyat akkauntning darhol bloklanishiga sabab bo‘lishi mumkin.</p>
              <p>14. Homiylik huquqlari ma'muriyat tomonidan o‘zgartirilishi, cheklanishi yoki bekor qilinishi mumkin.</p>
              <p>15. Ro‘yxatdan o‘tish va homiylik akkauntidan foydalanish orqali foydalanuvchi ushbu qoidalarning barchasiga to‘liq rozilik bildiradi.</p>
            </div>
          </div>

          <form onSubmit={handleApply} className="space-y-6">
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                {error}
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer p-4 border border-white/5 rounded-xl bg-slate-950/50 hover:bg-slate-900/50 transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/20 bg-slate-900 text-pink-500 focus:ring-pink-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-300 select-none">
                Men yuqoridagi barcha 15 ta qoidalarni o'qib chiqdim va rozi bo'ldim. Homiylik va Tarjimonlik qoidalariga to'liq amal qilishni o'z zimmamga olaman.
              </span>
            </label>

            {!user ? (
              <div className="text-center p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <p className="text-violet-300 text-sm mb-3">Ariza yuborish uchun tizimga kiring</p>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Tizimga kirish
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 text-white font-bold rounded-xl text-base shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Yuborilmoqda...' : (
                  <>
                    <span>Arizani yuborish</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
