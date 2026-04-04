import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import KategoriClient from './KategoriClient';

export async function generateMetadata({ params }) {
  const { kategoriSlug } = await params;
  
  // Format slug "penalaran-umum" menjadi "Penalaran Umum"
  const categoryName = kategoriSlug.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const descPreview = `Kumpulan paket latihan soal ${categoryName} untuk persiapan UTBK SNBT lengkap dengan pembahasan interaktif.`;

  return {
    title: `Materi ${categoryName} | Minat Matematika`,
    description: descPreview,
    alternates: {
      canonical: `/${kategoriSlug}`, 
    },
    openGraph: {
      title: `Materi ${categoryName} | Minat Matematika`,
      description: descPreview,
      url: `/${kategoriSlug}`,
      siteName: 'Minat Matematika',
      images: [
        {
          url: '/social-cover.jpg', // Ganti dengan gambar default edukasi kamu
          width: 800,
          height: 600,
          alt: `Materi ${categoryName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Materi ${categoryName} | Minat Matematika`,
      description: descPreview,
    },
  };
}

export default async function Page({ params }) {
  const { kategoriSlug } = await params;
  await dbConnect();

  const formattedCategoryName = kategoriSlug.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Ambil semua paket soal di kategori ini
  const postsInCategory = await Post.find({ categories: formattedCategoryName })
    .select('title slug categories publishDate')
    .sort({ publishDate: 1 }) // Urutkan dari paket paling awal
    .lean();

  const serializedPosts = postsInCategory.map(post => ({
    ...post,
    _id: post._id.toString(),
    publishDate: post.publishDate?.toISOString(),
  }));

  // Buat objek Kategori (mirip dengan objek Novel)
  const categoryData = {
    slug: kategoriSlug,
    name: formattedCategoryName,
    description: `Selamat datang di materi pembelajaran <strong>${formattedCategoryName}</strong>. Di sini kamu akan menemukan kumpulan paket soal latihan beserta pembahasannya yang disusun secara terstruktur untuk membantumu menaklukkan soal-soal UTBK SNBT.<br><br>Silakan pilih paket soal di daftar menu samping untuk mulai belajar, atau klik tombol <em>Lanjut Belajar</em> jika kamu sudah pernah mengerjakan paket sebelumnya.`,
    views: serializedPosts.length * 150 // Mock views, bisa diabaikan atau diganti logika asli
  };

  return <KategoriClient category={categoryData} allPosts={serializedPosts} />;
}