// File: src/components/AdBanner.jsx
'use client';

import React, { useEffect, useRef } from 'react';

export default function AdBanner({ dataAdSlot, dataAdFormat = 'auto', dataFullWidthResponsive = true }) {
  const adLoaded = useRef(false);

  useEffect(() => {
    // Memastikan skrip ini hanya berjalan di sisi client (browser)
    if (typeof window !== 'undefined' && !adLoaded.current) {
      
      // Memberikan jeda 200ms agar CSS dan browser selesai merender ukuran kotak (width)
      const timer = setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adLoaded.current = true;
        } catch (error) {
          console.error("AdSense Error:", error);
        }
      }, 200);

      // Membersihkan timer jika komponen dilepas dari layar sebelum waktunya habis
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div 
      style={{ 
        width: '100%',
        display: 'block',
        margin: '20px auto', 
        textAlign: 'center', 
        overflow: 'hidden', 
        minHeight: '90px',
        ...style // <--- Menambahkan ini agar style dari luar bisa masuk
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