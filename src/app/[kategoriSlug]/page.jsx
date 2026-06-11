import { cache } from 'react'; // <-- 1. IMPORT REACT CACHE
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Materi from '@/models/Materi'; 
import KategoriClient from './KategoriClient';
import { redirect, notFound } from 'next/navigation';

// ==========================================
// 2. JURUS ISR CACHING VERCEL (60 Detik)
// ==========================================
export const revalidate = 60;

// ==========================================
// 3. JURUS MEMOIZE DATABASE CALL
// Fungsi ini akan menyimpan hasil pencarian materi 
// agar tidak dipanggil 2x oleh Metadata dan Page
// ==========================================
const getMateri = cache(async (slug) => {
  await dbConnect();
  return await Materi.findOne({ slug }).lean();
});

export async function generateMetadata({ params }) {
  const { kategoriSlug } = await params;
  
  // Ambil data menggunakan cache
  const materi = await getMateri(kategoriSlug);
  
  const categoryName = materi ? materi.name : kategoriSlug.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const rawDesc = materi?.description ? materi.description.replace(/<[^>]+>/g, '').substring(0, 160) : `Kumpulan paket latihan soal ${categoryName} untuk persiapan UTBK SNBT.`;

  return {
    title: `Materi ${categoryName} | Minat Matematika`,
    description: rawDesc,
    alternates: { canonical: `/${kategoriSlug}` },
    openGraph: {
      title: `Materi ${categoryName} | Minat Matematika`,
      description: rawDesc,
      url: `/${kategoriSlug}`,
      siteName: 'Minat Matematika',
      images: [
        {
          url: materi?.coverImage || '/social-cover.jpg', 
          width: 800,
          height: 600,
          alt: `Materi ${categoryName}`,
        },
      ],
    },
  };
}

export default async function Page({ params }) {
  const { kategoriSlug } = await params;

  // Ambil data menggunakan cache (GRATIS, tidak hit database lagi!)
  const materi = await getMateri(kategoriSlug);

  const formattedCategoryName = materi ? materi.name : kategoriSlug.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Tetap butuh dbConnect di sini untuk pencarian Post
  await dbConnect();

  const postsInCategory = await Post.find({ 
      categories: formattedCategoryName,
      status: { $ne: 'draft' } // <-- Filter draft Bos yang sudah sempurna!
    })
    .select('title slug categories publishDate')
    .sort({ publishDate: 1 }) 
    .lean();

  // --- JURUS REDIRECT UNTUK PM ---
  if (kategoriSlug === 'penalaran-matematika') {
    if (postsInCategory.length > 0) {
      redirect(`/${kategoriSlug}/${postsInCategory[0].slug}`);
    } else {
      redirect('/'); 
    }
  }

  if (!materi && postsInCategory.length === 0) {
    notFound();
  }

  const serializedPosts = postsInCategory.map(post => ({
    ...post,
    _id: post._id.toString(),
    publishDate: post.publishDate?.toISOString(),
  }));

  const categoryData = {
    slug: kategoriSlug,
    name: formattedCategoryName,
    description: materi?.description || `<p>Belum ada deskripsi untuk materi ini.</p>`,
    views: serializedPosts.length * 150 
  };

  return <KategoriClient category={categoryData} allPosts={serializedPosts} />;
}