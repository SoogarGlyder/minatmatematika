// File: src/app/[topicSlug]/[packetSlug]/page.jsx
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';
import PaketSoal from '@/models/PaketSoal';
import { stripHtml } from '@/utils/stringUtils';
import PacketClient from './PacketClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  try {
    const { topicSlug, packetSlug } = await params;
    await dbConnect();

    // Cari materi/topiknya dulu
    const topic = await Topic.findOne({ slug: topicSlug })
      .select('title coverImage')
      .lean();
    
    if (!topic) {
      return { title: 'Materi Tidak Ditemukan | Minat Matematika' };
    }

    // Cari paket soalnya
    const packet = await PaketSoal.findOne({ 
        topic: topic._id, 
        paket_slug: packetSlug 
    }).select('title content').lean();

    if (!packet) {
      return { title: `Paket Tidak Ditemukan | ${topic.title} | Minat Matematika` };
    }

    const rawContent = packet.content || `Belajar ${topic.title} ${packet.title}`;
    const descPreview = stripHtml(rawContent).substring(0, 160);
    const ogImage = topic.coverImage || '/social-cover.jpg';
    const currentUrl = `/${topicSlug}/${packetSlug}`;

    return {
      title: `${packet.title} | ${topic.title} | Minat Matematika`,
      description: descPreview,
      
      alternates: {
        canonical: currentUrl, 
      },

      openGraph: {
        title: `${packet.title} | ${topic.title}`,
        description: descPreview,
        url: currentUrl,
        type: 'article',
        siteName: 'Minat Matematika',
        images: [
          {
            url: ogImage,
            width: 800,
            height: 600,
            alt: `${topic.title} - ${packet.title}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${packet.title} | ${topic.title} | Minat Matematika`,
        description: descPreview,
        images: [ogImage],
      },
    };

  } catch (error) {
    console.error("Metadata Error:", error);
    return {
      title: 'Minat Matematika',
      description: 'Platform Belajar Matematika Lengkap dan Mudah.',
    };
  }
}

export default async function Page({ params }) {
  const { topicSlug, packetSlug } = await params;
  
  await dbConnect();

  const topic = await Topic.findOne({ slug: topicSlug }).lean();
  if (!topic) notFound();

  // Mengambil isi paket soal
  const currentPacket = await PaketSoal.findOne({ topic: topic._id, paket_slug: packetSlug }).lean();
  if (!currentPacket) notFound();

  // Mengambil daftar navigasi (semua paket di materi yang sama)
  const allPackets = await PaketSoal.find({ topic: topic._id })
    .select('title paket_slug paket_number')
    .sort({ paket_number: 1 })
    .lean();

  const currentIndex = allPackets.findIndex(p => p.paket_slug === packetSlug);
  const prevPacket = currentIndex > 0 ? allPackets[currentIndex - 1] : null;
  const nextPacket = currentIndex < allPackets.length - 1 ? allPackets[currentIndex + 1] : null;

  const serialize = (obj) => {
    if (!obj) return null;
    return {
      ...obj,
      _id: obj._id.toString(),
      createdAt: obj.createdAt?.toISOString(),
      updatedAt: obj.updatedAt?.toISOString(),
      topic: obj.topic ? obj.topic.toString() : null, // Ubah relasi novel ke topic
    };
  };

  const serializedTopic = serialize(topic);
  const serializedCurrentPacket = serialize(currentPacket);
  const serializedAllPackets = allPackets.map(p => ({
    ...p,
    _id: p._id.toString(), 
  }));
  const serializedPrev = serialize(prevPacket);
  const serializedNext = serialize(nextPacket);

  // SEO JSON-LD Breadcrumbs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: 'https://www.minatmatematika.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: topic.title,
        item: `https://www.minatmatematika.com/${topicSlug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: currentPacket.title,
        item: `https://www.minatmatematika.com/${topicSlug}/${packetSlug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PacketClient 
        topic={serializedTopic}
        packet={serializedCurrentPacket}
        allPackets={serializedAllPackets}
        prevPacket={serializedPrev}
        nextPacket={serializedNext}
      />
    </>
  );
}