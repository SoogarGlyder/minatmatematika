import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; // Sesuaikan jika namanya dbConnect.js
import Post from '@/models/Post';
import Materi from '@/models/Materi';

export async function GET(request) {
  try {
    await dbConnect();

    // Mengambil parameter tab yang diklik (misal: ?tab=PM atau ?tab=PKS 10)
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'terbaru';

    let results = [];

    // JALUR CEPAT 1: TAB TERBARU (Mengambil Paket Soal paling baru dari semua kategori)
    if (tab === 'terbaru') {
      const posts = await Post.find({ status: { $ne: 'draft' } })
        .select('title slug categories featuredImage publishDate')
        .sort({ publishDate: -1 }) // Urutkan dari yang terbaru
        .limit(15) // Batasi 15 kartu agar tidak berat
        .lean();

      results = posts.map(p => {
        const catSlug = p.categories && p.categories.length > 0 
            ? p.categories[0].toLowerCase().replace(/[^a-z0-9]+/g, '-') 
            : 'umum';
        return {
          _id: p._id.toString(),
          title: p.title,
          image: p.featuredImage || 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop',
          href: `/${catSlug}/${p.slug}`, // Link langsung ke halaman Soal-Pembahasan
          type: 'paket-soal'
        };
      });

    } 
    // JALUR CEPAT 2: TAB PM / Penalaran Matematika (Mengambil Paket Soal PM)
    else if (tab === 'PM') {
      const posts = await Post.find({ categories: 'Penalaran Matematika' })
        .select('title slug featuredImage publishDate')
        .sort({ publishDate: 1 }) // Urutkan dari paket 01, 02 dst
        .lean();

      results = posts.map(p => ({
        _id: p._id.toString(),
        title: p.title,
        image: p.featuredImage || 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop',
        href: `/penalaran-matematika/${p.slug}`, // Link langsung ke halaman Soal-Pembahasan
        type: 'paket-soal'
      }));

    } 
    // JALUR MATERI: Tab PU, PK, PKS 10, PKS 11, PKS 12 (Mengambil Data Deskripsi Materi)
    else {
      // Mencari data di koleksi Materi berdasarkan Tab (parentMenu)
      const materis = await Materi.find({ parentMenu: tab })
        .select('name slug coverImage')
        .sort({ createdAt: 1 })
        .lean();

      results = materis.map(m => ({
        _id: m._id.toString(),
        title: m.name,
        image: m.coverImage || 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop',
        href: `/${m.slug}`, // Link ke Halaman Kategori/Deskripsi Materi (BUKAN ke paket soal)
        type: 'materi-bab'
      }));
    }

    // Kirim data yang sudah rapi ke Frontend
    return NextResponse.json({ success: true, data: results });

  } catch (error) {
    console.error("Grid API Error:", error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data grid.' }, 
      { status: 500 }
    );
  }
}