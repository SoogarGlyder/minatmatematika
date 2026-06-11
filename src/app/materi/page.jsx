// File: src/app/materi/page.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import styles from './Materi.module.css';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

export const dynamic = 'force-dynamic'; 
export const metadata = {
  title: 'Materi & Artikel | Minat Matematika',
  description: 'Kumpulan materi ringkas, panduan belajar, pembahasan mendalam, dan tips jitu seputar matematika UTBK/SNBT hanya di Minat Matematika.',
  alternates: {
    canonical: '/materi', 
  },
  openGraph: {
    title: 'Materi & Artikel Edukasi', 
    description: 'Kumpulan materi ringkas, panduan belajar, pembahasan mendalam, dan tips jitu seputar matematika UTBK/SNBT.',
    url: '/materi',
    siteName: 'Minat Matematika',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/social-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Materi Minat Matematika',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Materi & Artikel | Minat Matematika',
    description: 'Kumpulan materi ringkas, panduan belajar, pembahasan mendalam, dan tips jitu seputar matematika UTBK/SNBT.',
    images: ['/social-cover.jpg'],
  },
};

async function getArticles() {
  await dbConnect();
  const articles = await Article.find({})
    .select('title slug date image tags excerpt createdAt updatedAt')
    .sort({ createdAt: -1 })
    .lean();
  
  return articles.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  }));
}

export default async function ArticleListPage() {
  const articles = await getArticles();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Materi & Artikel Minat Matematika',
    description: 'Kumpulan materi dan panduan belajar matematika terpadu.',
    url: 'https://www.minatmatematika.com/materi',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.minatmatematika.com/materi/${article.slug}`,
        name: article.title
      }))
    }
  };

  return (
    <div className={styles.container}>
      <Script
        id="json-ld-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Daftar Materi & Artikel</h1>
        <p className={styles.pageSubtitle}>
          Kumpulan rangkuman materi, panduan belajar, dan pembahasan mendalam seputar matematika dan persiapan ujian.
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#888' }}>
          <p>Belum ada materi yang diterbitkan.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {articles.map((article) => {
            const displayImage = article.image || '/social-cover.jpg'; 
            
            return (
              <Link href={`/materi/${article.slug}`} key={article._id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image 
                    src={displayImage} 
                    alt={article.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }} 
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.meta}>
                    <span className={styles.date}>{article.date}</span>
                    <span className={styles.tag}>
                      {Array.isArray(article.tags) && article.tags.length > 0 ? article.tags[0] : 'Materi Utama'}
                    </span>
                  </div>
                  <h2 className={styles.cardTitle}>{article.title}</h2>
                  <p className={styles.cardExcerpt}>{article.excerpt}</p>
                  <span className={styles.readMore}>Pelajari Selengkapnya &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}