'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { AlertCircle, FileText, Heart } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-white/5 bg-slate-950/60 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div>
            <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent">
              {t('common.appName')}
            </span>
            <p className="mt-1.5 text-xs text-slate-500">
              © {new Date().getFullYear()} {t('common.appName')}. Barcha huquqlar himoyalangan.
            </p>
          </div>

          {/* Bottom Links */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <Link
              href="/catalog"
              className="hover:text-violet-400 transition-colors"
            >
              {t('common.catalog')}
            </Link>
            
            {/* Quick Link to report an issue */}
            <Link
              href="/dashboard?report=true"
              className="flex items-center gap-1 hover:text-violet-400 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Muammo haqida xabar berish</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <p className="flex items-center justify-center gap-1 text-[10px] text-slate-600">
            Platforma
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            bilan o'zbek muxlislari uchun tayyorlandi.
          </p>
        </div>
      </div>
    </footer>
  );
}
