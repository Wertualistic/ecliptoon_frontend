'use client';

import React from 'react';
import { useTranslation } from '@/context/I18nContext';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface MatureGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MatureGateModal({ isOpen, onConfirm, onCancel }: MatureGateModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-md" 
        onClick={onCancel}
      ></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-950/20 text-center z-10 animate-pulse-glow">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500">
            <ShieldAlert className="w-12 h-12" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-red-400 mb-2">
          {t('ageGate.title')}
        </h3>
        
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          {t('ageGate.description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            {t('ageGate.exitBtn')}
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-lg shadow-red-600/15 transition-all cursor-pointer"
          >
            {t('ageGate.confirmBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
