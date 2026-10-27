// File: src/components/AdBanner.jsx
'use client';

import React, { useEffect, useRef } from 'react';
import { scheduleAdPush } from '@/lib/adLoader';

export default function AdBanner({ 
  dataAdSlot, 
  dataAdFormat = 'auto', 
  dataFullWidthResponsive = true,
  style = {} // Gaya tambahan untuk kotak pembungkus (mis. ukuran tetap 300x250)
}) {
  const adLoaded = useRef(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || adLoaded.current || !wrapperRef.current) return undefined;

    // Iklan baru diminta saat kotaknya mendekati layar, dan tidak pernah untuk kotak yang
    // tersembunyi (mis. sidebar kanan yang disembunyikan di HP). Lihat src/lib/adLoader.js.
    return scheduleAdPush({
      node: wrapperRef.current,
      win: window,
      ObserverImpl: window.IntersectionObserver,
      onPushed: () => { adLoaded.current = true; },
    });
  }, []);

  return (
    <div 
      ref={wrapperRef}
      style={{ 
        width: '100%',
        display: 'block',
        margin: '0px auto', 
        overflow: 'hidden', 
        minHeight: '90px',
        ...style
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-4365395677457990"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
