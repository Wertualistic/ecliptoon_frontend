'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        initDataUnsafe?: {
          start_param?: string;
        };
      };
    };
  }
}

export function TelegramInit() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();
        webApp.enableClosingConfirmation();
        
        // Match the background slate-950 color of ecliptoon (#020617)
        if (typeof webApp.setHeaderColor === 'function') {
          webApp.setHeaderColor('#020617');
        }
        if (typeof webApp.setBackgroundColor === 'function') {
          webApp.setBackgroundColor('#020617');
        }

        // Handle Telegram Web App Deep Linking (startapp query parameter)
        const startParam = webApp.initDataUnsafe?.start_param;
        if (startParam) {
          if (startParam.startsWith('series_')) {
            const slug = startParam.replace('series_', '');
            router.push(`/series/${slug}`);
          }
        }
      } catch (err) {
        console.error('Failed to initialize Telegram WebApp SDK:', err);
      }
    }
  }, [router]);

  return null;
}
