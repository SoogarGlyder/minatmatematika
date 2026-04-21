import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; 
import Post from '@/models/Post';
import Materi from '@/models/Materi';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'terbaru';

    let results = [];

    if (tab === 'terbaru') {
      const posts = await Post.find({ status: { $ne: 'draft' } })
        .select('title slug categories featuredImage publishDate')
        .sort({ publishDate: -1 }) 
        .limit(15) 
        .lean();

      results = posts.map(p => {
        const catSlug = p.categories && p.categories.length > 0 
            ? p.categories[0].toLowerCase().replace(/[^a-z0-9]+/g, '-') 
            : 'umum';
        return {
          _id: p._id.toString(),
          title: p.title,
          image: p.featuredImage || 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop',
          href: `/${catSlug}/${p.slug}`, 
          type: 'paket-soal'
        };
      });

    } else if (tab === 'PM') {
      const posts = await Post.find({ categories: 'Penalaran Matematika', status: { $ne: 'draft' } })
        .select('title slug featuredImage publishDate')
        .sort({ publishDate: 1 }) 
        .lean();

      results = posts.map(p => ({
        _id: p._id.toString(),
        title: p.title,
        image: p.featuredImage || 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop',
        href: `/penalaran-matematika/${p.slug}`, 
        type: 'paket-soal'
      }));

    } else {
      const materis = await Materi.find({ parentMenu: tab })
        .select('name slug coverImage')
        .sort({ createdAt: 1 })
        .lean();

      results = materis.map(m => ({
        _id: m._id.toString(),
        title: m.name,
        image: m.coverImage || 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop',
        href: `/${m.slug}`, 
        type: 'materi-bab'
      }));
    }

    // --- JURUS CACHING VERCEL ---
    return NextResponse.json(
      { success: true, data: results },
      {
        headers: {
          // Cache di CDN Vercel selama 60 detik.
          // Jika ada yg akses di detik 61, Vercel berikan cache lama dulu (tanpa loading), 
          // lalu update background dalam max 300 detik.
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      }
    );

  } catch (error) {
    console.error("Grid API Error:", error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data grid.' }, 
      { status: 500 }
    );
  }
}