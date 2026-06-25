'use client';

import React, { useEffect } from 'react';

interface AdSenseAdProps {
  slot: string;
}

export default function AdSenseAd({ slot }: AdSenseAdProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Ensure the adsbygoogle array is available and push the config
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, []);

  return (
    <div className="my-6 flex justify-center w-full min-h-[90px] overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-8603051910555547"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
