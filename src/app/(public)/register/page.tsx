'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { StrawberryIcon } from '@/components/StrawberryIcon';
interface IconProps {
  className?: string;
}

function SvgUserRound({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="5"/>
      <path d="M20 21a8 8 0 0 0-16 0"/>
    </svg>
  );
}

function SvgMail({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function SvgLock({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function SvgArrowRight({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

function SvgKeyRound({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.778Zm0 0L15.5 7.5m0 0 1.5 1.5M15.5 7.5 14 6"/>
    </svg>
  );
}

function SvgUserPlus({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" x2="19" y1="8" y2="14"/>
      <line x1="16" x2="22" y1="11" y2="11"/>
    </svg>
  );
}

function SvgArrowLeft({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7"/>
      <path d="M19 12H5"/>
    </svg>
  );
}

function RegisterForm() {
  const { register, registerVerifyCode } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [refParam, setRefParam] = useState<string | null>(null);
  const [agreed, setAgreed] = useState<boolean>(false);

  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setRefParam(params.get('ref'));
    }
  }, []);

  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !agreed) {
      setError(!agreed ? 'Iltimos, Foydalanish shartlari va qoidalariga rozilik bildiring.' : t('auth.fieldsRequired'));
      return;
    }

    setError(null);
    setLoading(true);

    const res = await register(name, email, password, refParam);
    if (res.success) {
      setStep('verify');
      setInfoMessage("Tasdiqlash kodi emailingizga yuborildi. Kodni quyida kiriting.");
      setLoading(false);
    } else {
      setError(res.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      setLoading(false);
    }
  };

  const handleCodeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    target.value = target.value.replace(/\D/g, ''); // Numeric only
  };

  const handleVerifyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = codeRef.current?.value || '';
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kerak.");
      return;
    }

    setError(null);
    setLoading(true);

    const res = await registerVerifyCode(email, verificationCode);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.message || 'Tasdiqlash kodi noto\'g\'ri yoki muddati tugagan.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 py-8 animate-fade-in">
      <div className="glass-card border border-white/5 rounded-2xl p-8 shadow-2xl space-y-6">
        {step === 'form' ? (
          /* Step 1: Account details form */
          <div key="step-form" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                {t('auth.registerTitle')}
              </h2>
              <p className="text-xs text-slate-400">
                ecliptoon dunyosiga qo'shiling va sevimli manhwalarni o'qing
              </p>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">
                  {t('auth.nameLabel')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ismingiz va familiyangiz"
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm pl-10 pr-4 py-3 rounded-xl outline-none focus:border-violet-500 transition-colors"
                    required
                  />
                  <SvgUserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@ecliptoon.uz"
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm pl-10 pr-4 py-3 rounded-xl outline-none focus:border-violet-500 transition-colors"
                    required
                  />
                  <SvgMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi"
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm pl-10 pr-4 py-3 rounded-xl outline-none focus:border-violet-500 transition-colors"
                    required
                  />
                  <SvgLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>

              {refParam && (
                <div className="text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl text-center font-bold">
                  Siz taklifnoma havolasi orqali ro'yxatdan o'tmoqdasiz (+2 <StrawberryIcon /> bonus)
                </div>
              )}

              <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-300">Foydalanish shartlari va qoidalari</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-2">
                  Saytdan ro‘yxatdan o‘tish yoki foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz:<br/><br/>
                  1. Foydalanuvchi saytga kiritgan ma’lumotlarining to‘g‘riligiga javobgar hisoblanadi.<br/>
                  2. Saytdagi manhwa, webtoon va boshqa materiallardan faqat shaxsiy foydalanish maqsadida foydalanish mumkin.<br/>
                  3. Saytdagi kontentni administrator ruxsatisiz nusxalash, tarqatish yoki tijorat maqsadida ishlatish taqiqlanadi.<br/>
                  4. Foydalanuvchi boshqa foydalanuvchilarga nisbatan haqoratli, noqonuniy yoki zararli harakatlarni amalga oshirmasligi kerak.<br/>
                  5. Sayt ma’muriyati istalgan vaqtda qoidalarni o‘zgartirish yoki yangilash huquqiga ega.<br/>
                  6. Qoidalarni buzgan foydalanuvchilarning akkauntlari ogohlantirishsiz cheklanishi yoki o‘chirib tashlanishi mumkin.<br/>
                  7. Sayt xizmatlaridan foydalanish natijasida yuzaga keladigan texnik nosozliklar yoki vaqtinchalik uzilishlar uchun ma’muriyat javobgar emas.<br/>
                  8. Foydalanuvchilarning shaxsiy ma’lumotlari maxfiylik siyosatiga muvofiq himoyalanadi.<br/>
                  9. Saytda ro‘yxatdan o‘tish orqali foydalanuvchi ushbu shartlarning barchasini o‘qiganini va ularga to‘liq rozilik bildirganini tasdiqlaydi.
                </p>
                <label className="flex items-start gap-2 cursor-pointer mt-2 pt-2 border-t border-white/5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-white/10 bg-slate-950 text-violet-500 focus:ring-violet-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-300 select-none">
                    Men Foydalanish shartlari va qoidalariga roziman.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? t('common.loading') : (
                  <>
                    <span>Tasdiqlash kodini olish</span>
                    <SvgArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-white/5 pt-4 text-center">
              <p className="text-xs text-slate-400">
                {t('auth.hasAccount')}{' '}
                <Link
                  href="/login"
                  className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-0.5"
                >
                  <span>{t('auth.loginTitle')}</span>
                  <SvgArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* Step 2: Verification code entry screen */
          <div key="step-verify" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-2">
                <SvgKeyRound className="w-6 h-6 text-violet-400" />
                <span>Emailni tasdiqlash</span>
              </h2>
              <p className="text-xs text-slate-400">
                {email} manziliga yuborilgan 6 xonali tasdiqlash kodini kiriting
              </p>
            </div>

            {infoMessage && (
              <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                {infoMessage}
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold block text-center uppercase tracking-wider">
                  Tasdiqlash kodi
                </label>
                <input
                  ref={codeRef}
                  type="text"
                  maxLength={6}
                  onInput={handleCodeInput}
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-white/10 text-slate-100 text-center font-extrabold text-xl py-3 rounded-xl outline-none focus:border-violet-500 tracking-[0.4em] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? t('common.loading') : (
                  <>
                    <span>Tasdiqlash va kirish</span>
                    <SvgUserPlus className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="w-full flex items-center justify-center gap-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white border border-white/5 rounded-xl transition-all cursor-pointer"
              >
                <SvgArrowLeft className="w-3.5 h-3.5" />
                <span>Ma'lumotlarni o'zgartirish</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}

