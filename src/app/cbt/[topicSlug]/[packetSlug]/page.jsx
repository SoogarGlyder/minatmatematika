// File: src/app/cbt/[topicSlug]/[packetSlug]/page.jsx
// Mode CBT: memakai try out terstruktur jika paket sudah punya soal di koleksi `questions`;
// jika belum, otomatis memakai CBT lama (parsing HTML paket) sebagai cadangan.
import React from 'react';
import PacketPageContent from '@/app/[topicSlug]/[packetSlug]/page';
import TryoutClient from '@/components/Tryout/TryoutClient';
import { getTryoutData } from '@/lib/getTryoutData';

export const metadata = {
  title: 'Mode CBT',
  robots: {
    index: false,   // Melarang Google memasukkan halaman ini ke hasil pencarian
    follow: false,  // Melarang Google menelusuri link-link yang ada di dalam halaman ini
    nocache: true,  // Melarang Google menyimpan versi cache (rekaman) dari halaman ini
  },
};

export default async function CbtPage(props) {
  const { topicSlug, packetSlug } = await props.params;
  const data = await getTryoutData(topicSlug, packetSlug);

  if (data) return <TryoutClient {...data} />;

  // Cadangan: CBT lama
  return <PacketPageContent {...props} />;
}
