// File: src/app/[topicSlug]/page.jsx
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';
import PaketSoal from '@/models/PaketSoal';
import { stripHtml } from '@/utils/stringUtils';
import TopicClient from './TopicClient';
import { notFound } from 'next/navigation';
import { buildTopicSeo } from '@/lib/seoText.mjs';

const BASE_URL = 'https://www.minatmatematika.com';

// Segarkan cache tiap 10 menit (lihat catatan di halaman paket).
export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { topicSlug } = await params;
  await dbConnect();
  
  // Mengambil data topik dari database
  const topic = await Topic.findOne({ slug: topicSlug })
    .select('title description coverImage')
    .lean();

  if (!topic) {
    return {
      title: 'Materi Tidak Ditemukan | Minat Matematika',
      description: 'Halaman materi yang Anda cari tidak tersedia.',
    };
  }

  const paketCount = await PaketSoal.countDocuments({ topic: topic._id });
  const seo = buildTopicSeo({ title: topic.title, description: stripHtml(topic.description || ''), paketCount });
  const cleanDescription = seo.description;
  const ogImage = topic.coverImage || '/social-cover.jpg';

  return {
    title: seo.title,
    description: cleanDescription,
    
    alternates: {
      canonical: `/${topicSlug}`, 
    },

    openGraph: {
      title: topic.title,
      description: cleanDescription,
      url: `/${topicSlug}`,
      siteName: 'Minat Matematika',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: topic.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: cleanDescription,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }) {
  const { topicSlug } = await params;
  await dbConnect();

  const topic = await Topic.findOne({ slug: topicSlug }).lean();

  if (!topic) {
    notFound();
  }

  // Mengambil daftar Paket Soal yang terkait dengan Topik ini
  const paketList = await PaketSoal.find({ topic: topic._id })
    .select('title paket_slug paket_number') 
    .sort({ paket_number: 1 }) 
    .lean();

  // Menyiapkan data agar aman dikirim ke Client (Browser)
  const serializedTopic = {
    ...topic,
    _id: topic._id.toString(),
    createdAt: topic.createdAt?.toISOString(),
    updatedAt: topic.updatedAt?.toISOString(),
  };

  const serializedPaketList = paketList.map(paket => ({
    ...paket,
    _id: paket._id.toString(),
  }));

  // Data terstruktur: breadcrumb (didukung Google) dan daftar paket pada topik ini
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: topic.title, item: `${BASE_URL}/${topicSlug}` },
    ],
  };
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.title,
    url: `${BASE_URL}/${topicSlug}`,
    inLanguage: 'id',
    isPartOf: { '@type': 'WebSite', name: 'Minat Matematika', url: BASE_URL },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: paketList.map((paket, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: paket.title,
        url: `${BASE_URL}/${topicSlug}/${paket.paket_slug}`,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <TopicClient initialTopic={serializedTopic} initialPaketList={serializedPaketList} />
    </>
  );
}