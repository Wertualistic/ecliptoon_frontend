'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}

export function TelegramInit() {
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
      } catch (err) {
        console.error('Failed to initialize Telegram WebApp SDK:', err);
      }
    }
  }, []);

  return null;
}
