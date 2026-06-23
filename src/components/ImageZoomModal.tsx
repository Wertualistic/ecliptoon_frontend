'use client';

import React from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  title?: string;
}

export function ImageZoomModal({ isOpen, imageUrl, onClose, title }: ImageZoomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/90 backdrop-filter backdrop-blur-sm cursor-zoom-out" 
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10 flex flex-col">
        {/* Header toolbar */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-950/80 border-b border-white/5">
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            {title || "To'lov kvitansiyasi (Receipt)"}
          </span>
          
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display */}
        <div className="p-4 flex-grow overflow-auto flex items-center justify-center bg-slate-950/50 min-h-[400px]">
          <img
            src={imageUrl}
            alt="Receipt Full Preview"
            className="max-w-full max-h-[75vh] object-contain rounded border border-white/5"
          />
        </div>
      </div>
    </div>
  );
}
