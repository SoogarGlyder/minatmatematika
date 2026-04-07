import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Materi from '@/models/Materi'; // <-- IMPORT DATABASE MATERI
import KategoriClient from './KategoriClient';
import { redirect, notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { kategoriSlug } = await params;
  await dbConnect();
  
  // Ambil data materi asli untuk Metadata SEO
  const materi = await Materi.findOne({ slug: kategoriSlug }).lean();
  
  const categoryName = materi ? materi.name : kategoriSlug.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Gunakan deskripsi asli jika ada, jika tidak pakai default
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
  await dbConnect();

  // 1. CARI DATA MATERI ASLI DARI DATABASE
  const materi = await Materi.findOne({ slug: kategoriSlug }).lean();

  const formattedCategoryName = materi ? materi.name : kategoriSlug.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const postsInCategory = await Post.find({ 
      categories: formattedCategoryName,
      status: { $ne: 'draft' } // <-- Tambahkan baris ini
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

  // Jika materi tidak ditemukan di DB, kembalikan 404 Not Found
  if (!materi && postsInCategory.length === 0) {
    notFound();
  }

  const serializedPosts = postsInCategory.map(post => ({
    ...post,
    _id: post._id.toString(),
    publishDate: post.publishDate?.toISOString(),
  }));

  // 2. MASUKKAN DATA ASLI KE DALAM OBJEK KATEGORI
  const categoryData = {
    slug: kategoriSlug,
    name: formattedCategoryName,
    description: materi?.description || `<p>Belum ada deskripsi untuk materi ini.</p>`,
    views: serializedPosts.length * 150 
  };

  return <KategoriClient category={categoryData} allPosts={serializedPosts} />;
}