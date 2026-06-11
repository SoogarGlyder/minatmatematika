// File: src/app/[topicSlug]/page.jsx
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';
import PaketSoal from '@/models/PaketSoal';
import { stripHtml } from '@/utils/stringUtils';
import TopicClient from './TopicClient';
import { notFound } from 'next/navigation';

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

  const rawDesc = topic.description || `Belajar materi ${topic.title} beserta soal dan pembahasan di Minat Matematika.`;
  const cleanDescription = stripHtml(rawDesc).substring(0, 160);
  const ogImage = topic.coverImage || '/social-cover.jpg';

  return {
    title: `${topic.title} | Minat Matematika`,
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
      title: `${topic.title} | Minat Matematika`,
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

  return <TopicClient initialTopic={serializedTopic} initialPaketList={serializedPaketList} />;
}