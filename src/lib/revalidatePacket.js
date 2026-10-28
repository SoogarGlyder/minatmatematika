// File: src/lib/revalidatePacket.js
// Menyegarkan cache halaman yang terkait paket soal setelah disimpan atau dihapus.
import { revalidatePath } from 'next/cache';
import Topic from '@/models/Topic';

// Menerima satu atau lebih dokumen paket (mis. versi sebelum dan sesudah diedit).
export async function revalidatePacketPaths(...packets) {
  try {
    const paths = new Set(['/sitemap.xml']);
    for (const p of packets.filter(Boolean)) {
      if (!p.topic || !p.paket_slug) continue;
      const topic = await Topic.findById(p.topic).select('slug').lean();
      if (!topic) continue;
      paths.add(`/${topic.slug}`);
      paths.add(`/${topic.slug}/${p.paket_slug}`);
      paths.add(`/cbt/${topic.slug}/${p.paket_slug}`);
    }
    paths.forEach((path) => revalidatePath(path));
  } catch (error) {
    console.error('Gagal revalidate paket:', error);
  }
}
