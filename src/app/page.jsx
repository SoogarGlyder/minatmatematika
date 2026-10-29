// File: src/app/page.jsx
// Server Component: daftar materi dirender di server supaya langsung ada di HTML
// (terbaca Google), bukan di-fetch dari browser setelah halaman terbuka.
import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';
import HomeClient from '@/components/Home/HomeClient';

export const revalidate = 300;

// Canonical beranda didefinisikan di sini (bukan di layout) agar tidak diwarisi semua halaman lain.
export const metadata = {
  alternates: { canonical: '/' },
}; // segarkan tiap 5 menit; juga di-refresh saat admin menyimpan materi

const CATEGORIES = [
  'Penalaran Umum',
  'Penalaran Matematika',
  'Pengetahuan Kuantitatif',
  'PKS Kelas 10',
  'PKS Kelas 11',
  'PKS Kelas 12',
];

async function getTopics() {
  try {
    await dbConnect();
    const topics = await Topic.find({})
      .select('title slug coverImage category')
      .sort({ createdAt: -1 })
      .lean();

    return topics.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      slug: t.slug,
      coverImage: t.coverImage || '',
      category: t.category,
    }));
  } catch (error) {
    console.error('Gagal memuat topik beranda:', error);
    return [];
  }
}

export default async function HomePage() {
  const topics = await getTopics();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingBottom: '20px' }}>
      <section style={{ textAlign: 'center', padding: '24px 16px 4px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
          Belajar Matematika & Tryout UTBK SNBT
        </h1>
        <p style={{ margin: '8px auto 0', maxWidth: '640px', opacity: 0.8, fontSize: '0.95rem' }}>
          Ringkasan materi, latihan soal, dan pembahasan terstruktur untuk Penalaran Umum,
          Penalaran Matematika, Pengetahuan Kuantitatif, dan PKS kelas 10-12.
        </p>
      </section>

      <HomeClient topics={topics} />

      {topics.length > 0 && (
        <details style={{ maxWidth: '960px', margin: '24px auto 0', padding: '0 16px', width: '100%' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Lihat semua materi</summary>
          {CATEGORIES.map((category) => {
            const items = topics.filter((t) => t.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} style={{ marginTop: '14px' }}>
                <h2 style={{ fontSize: '1rem', margin: '0 0 6px' }}>{category}</h2>
                <ul style={{ margin: 0, paddingLeft: '20px', columns: '2 220px' }}>
                  {items.map((t) => (
                    <li key={t._id}>
                      <Link href={`/${t.slug}`}>{t.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </details>
      )}
    </div>
  );
}
