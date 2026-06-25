'use client';

import React, { useEffect } from 'react';

interface YandexAdProps {
  blockId: string;
  renderTo: string;
  className?: string;
}

export default function YandexAd({ blockId, renderTo, className = 'my-6 flex justify-center w-full min-h-[100px]' }: YandexAdProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const yaContext = (window as any).yaContextCb || [];
      (window as any).yaContextCb = yaContext;
      
      yaContext.push(() => {
        if ((window as any).Ya?.Context?.AdvManager) {
          try {
            (window as any).Ya.Context.AdvManager.render({
              blockId: blockId,
              renderTo: renderTo,
            });
          } catch (err) {
            console.error('Yandex RTB Render Error:', err);
          }
        }
      });
    }
  }, [blockId, renderTo]);

  return (
    <div className={className}>
      <div id={renderTo} className="w-full max-w-full overflow-hidden" />
    </div>
  );
}
