import { cache } from 'react'; // <-- IMPORT REACT CACHE
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import PaketClient from './PaketClient';
import { notFound } from 'next/navigation';

// ==========================================
// JURUS 1: ISR CACHING VERCEL
// Halaman akan di-cache selama 60 detik. 
// Super cepat dan sangat hemat kuota MongoDB!
// ==========================================
export const revalidate = 60;

// ==========================================
// JURUS 2: MEMOIZE DATABASE CALL
// Mencegah Mongoose melakukan query 2x (untuk metadata dan untuk halaman)
// ==========================================
const getPost = cache(async (slug) => {
  await dbConnect();
  // Cegah akses langsung ke URL jika statusnya masih draft
  return await Post.findOne({ slug, status: { $ne: 'draft' } }).lean();
});

export async function generateMetadata({ params }) {
  try {
    const { kategoriSlug, paketSlug } = await params;

    // Menggunakan getPost yang sudah di-cache
    const post = await getPost(paketSlug);
    
    if (!post) {
      return { title: 'Materi Tidak Ditemukan | Minat Matematika' };
    }

    const categoryName = post.categories && post.categories.length > 0 
      ? post.categories[0] 
      : kategoriSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const rawContent = post.content || `Baca ${categoryName} - ${post.title}`;
    const descPreview = rawContent.replace(/<[^>]+>/g, '').substring(0, 160);
    const ogImage = post.featuredImage || '/social-cover.jpg';
    const currentUrl = `/${kategoriSlug}/${paketSlug}`;

    return {
      title: `${post.title} | ${categoryName} | Minat Matematika`,
      description: descPreview,
      alternates: {
        canonical: currentUrl, 
      },
      openGraph: {
        title: `${post.title} | ${categoryName}`,
        description: descPreview,
        url: currentUrl,
        type: 'article',
        siteName: 'Minat Matematika',
        images: [
          {
            url: ogImage,
            width: 800,
            height: 600,
            alt: `${categoryName} - ${post.title}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} | ${categoryName} | Minat Matematika`,
        description: descPreview,
        images: [ogImage],
      },
    };

  } catch (error) {
    console.error("Metadata Error:", error);
    return {
      title: 'Minat Matematika',
      description: 'Platform latihan soal UTBK SNBT Matematika.',
    };
  }
}

export default async function Page({ params }) {
  const { kategoriSlug, paketSlug } = await params;
  
  // Menggunakan getPost yang sudah di-cache (tidak perlu hit DB lagi)
  const currentPost = await getPost(paketSlug);
  if (!currentPost) notFound();

  const categoryName = currentPost.categories && currentPost.categories.length > 0 
    ? currentPost.categories[0] 
    : "Umum";

  // ==========================================
  // JURUS 3: TUTUP KEBOCORAN DRAFT
  // ==========================================
  const allPosts = await Post.find({ 
      categories: categoryName,
      status: { $ne: 'draft' } // <-- Cegah paket draft muncul di sidebar & Prev/Next
    })
    .select('title slug')
    .sort({ publishDate: 1 })
    .lean();

  const currentIndex = allPosts.findIndex(p => p.slug === paketSlug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const serialize = (obj) => {
    if (!obj) return null;
    return {
      ...obj,
      _id: obj._id.toString(),
      publishDate: obj.publishDate?.toISOString(),
    };
  };

  const serializedCurrentPost = serialize(currentPost);
  const serializedAllPosts = allPosts.map(p => ({
    ...p,
    _id: p._id.toString(), 
  }));
  const serializedPrev = serialize(prevPost);
  const serializedNext = serialize(nextPost);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: 'https://minatmatematika.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: `https://minatmatematika.com/${kategoriSlug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: currentPost.title,
        item: `https://minatmatematika.com/${kategoriSlug}/${paketSlug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PaketClient 
        kategoriSlug={kategoriSlug}
        categoryName={categoryName}
        post={serializedCurrentPost}
        allPosts={serializedAllPosts}
        prevPost={serializedPrev}
        nextPost={serializedNext}
      />
    </>
  );
}