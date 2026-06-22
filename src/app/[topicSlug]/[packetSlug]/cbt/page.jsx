// File: src/app/[topicSlug]/[packetSlug]/cbt/page.jsx
import React from 'react';
import PacketPageContent from '../page.jsx'; 

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