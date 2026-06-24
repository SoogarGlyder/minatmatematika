// File baru: src/app/cbt/[topicSlug]/[packetSlug]/page.jsx
import React from 'react';

// Menggunakan alias @ untuk langsung mengarah ke folder src/
import PacketPageContent from '@/app/[topicSlug]/[packetSlug]/page'; 

export const metadata = {
  title: 'Mode CBT',
  robots: {
    index: false,   // Melarang Google memasukkan halaman ini ke hasil pencarian
    follow: false,  // Melarang Google menelusuri link-link yang ada di dalam halaman ini
    nocache: true,  // Melarang Google menyimpan versi cache (rekaman) dari halaman ini
  },
};

export default async function CbtPage(props) {
  // Meneruskan seluruh parameter ke halaman induk
  return <PacketPageContent {...props} />;
}