'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';

interface IconProps {
  className?: string;
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

function SvgArrowLeft({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7"/>
      <path d="M19 12H5"/>
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const { forgotPasswordRequest, forgotPasswordVerify } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const codeRef = useRef<HTMLInputElement>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('auth.fieldsRequired'));
      return;
    }

    setError(null);
    setLoading(true);

    const res = await forgotPasswordRequest(email);
    if (res.success) {
      setStep('verify');
      setInfoMessage("Tasdiqlash kodi emailingizga yuborildi. Kodni va yangi parolni quyida kiriting.");
      setLoading(false);
    } else {
      setError(res.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  };

  const handleCodeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    target.value = target.value.replace(/\D/g, ''); // Numeric only
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = codeRef.current?.value || '';
    if (!verificationCode || verificationCode.length !== 6 || !password) {
      setError("Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi va yangi parol kiritilishi kerak.");
      return;
    }

    setError(null);
    setLoading(true);

    const res = await forgotPasswordVerify(email, verificationCode, password);
    if (res.success) {
      // Navigate back to login
      router.push('/login');
    } else {
      setError(res.message || 'Tasdiqlash kodi noto\'g\'ri yoki muddati tugagan.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 py-8 animate-fade-in">
      <div className="glass-card border border-white/5 rounded-2xl p-8 shadow-2xl space-y-6">
        {step === 'form' ? (
          /* Step 1: Request Code */
          <div key="step-form" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                Parolni tiklash
              </h2>
              <p className="text-xs text-slate-400">
                Profilingizga ulangan elektron pochta manzilini kiriting
              </p>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleRequest} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
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
                Parolingiz yodingizga tushdimi?{' '}
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
          /* Step 2: Verify Code and Set New Password */
          <div key="step-verify" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-2">
                <SvgKeyRound className="w-6 h-6 text-violet-400" />
                <span>Yangi parol o'rnatish</span>
              </h2>
              <p className="text-xs text-slate-400">
                {email} manziliga yuborilgan tasdiqlash kodini va yangi parolni kiriting
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

            <form onSubmit={handleVerify} className="space-y-4">
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

              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-slate-400 font-semibold">
                  Yangi parol
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? t('common.loading') : (
                  <>
                    <span>Parolni o'zgartirish</span>
                    <SvgArrowRight className="w-4 h-4" />
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
                <span>Pochta manzilini o'zgartirish</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
