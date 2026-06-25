'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.fieldsRequired'));
      return;
    }

    setError(null);
    setLoading(true);

    const res = await login(email, password);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 py-8">
      <div className="glass-card border border-white/5 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-xs text-slate-400">
            Platformaga kirish uchun hisob ma'lumotlarini kiriting
          </p>
        </div>

        {/* Errors */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
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
                placeholder="••••••"
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm pl-10 pr-4 py-3 rounded-xl outline-none focus:border-violet-500 transition-colors"
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
              Parolni unutdingizmi?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? t('common.loading') : (
              <>
                <span>{t('auth.loginBtn')}</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>

          <Link
            href="/forgot-password"
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm border border-white/5 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] text-center"
          >
            Parolni tiklash
          </Link>
        </form>

        <div className="border-t border-white/5 pt-4 text-center">
          <p className="text-xs text-slate-400">
            {t('auth.noAccount')}{' '}
            <Link
              href="/register"
              className="text-violet-400 hover:text-violet-300 font-semibold flex inline-flex items-center gap-0.5"
            >
              <span>{t('auth.registerTitle')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
