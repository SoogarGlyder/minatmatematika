// File: src/components/TopicList.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { useTopicList } from '../hooks/useTopicData';
import LoadingSpinner from './LoadingSpinner';

// Mengimpor komponen iklan yang sudah kita sempurnakan sebelumnya
import AdBanner from './AdBanner';

function TopicList({ activeSerie, onNovelClick }) {
  const { topics, loading, error } = useTopicList(activeSerie);

  const renderContent = () => {
    // 1. Menangani saat data masih dimuat
    if (loading) return <LoadingSpinner />;

    // 2. Menangani jika terjadi error
    if (error) {
      return (
        <div className={styles.novelListWrapper} style={{ color: 'var(--foreground)', padding: '20px', textAlign: 'center' }}>
          Terjadi kesalahan: {error}
        </div>
      );
    }
    
    // 3. Menangani jika kategori materi kosong
    if (!topics || topics.length === 0) {
      return (
        <div className={styles.novelListWrapper} style={{ color: 'var(--foreground)', padding: '20px', textAlign: 'center' }}>
          Tidak ada materi yang ditemukan.
        </div>
      );
    }
    
    // 4. Jika data sukses ditarik, mari kita tampilkan
    return (
      <div className={styles.novelGallery}>
        {/* Menggunakan reduce untuk menyisipkan iklan secara dinamis */}
        {topics.reduce((acc, topic, index) => {
          const href = `/${topic.slug}`;
          
          // --- BAGIAN A: Memasukkan Kartu Materi Asli ---
          acc.push(
            <Link 
              key={topic._id} 
              href={href}
              className={styles.contentCover}
              onClick={onNovelClick}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image 
                  src={topic.coverImage || '/social-cover.jpg'}
                  alt={topic.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  className={styles.contentCoverImg}
                  priority={false}
                />
              </div>
              <figcaption className={styles.captionLink}>
                {topic.title}
              </figcaption>
            </Link>
          );

          // --- BAGIAN B: Memasukkan Kartu Iklan ---
          // Logika (index + 1) % 4 === 0 berarti iklan muncul setiap 4 materi.
          // Kamu bisa mengubah angka 4 menjadi 5 atau 6 jika ingin iklan lebih jarang.
          if ((index + 1) % 4 === 0) {
            acc.push(
              <div 
                key={`ad-${topic._id}-${index}`} // Kunci unik agar React tidak bingung
                className={styles.contentCover} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: 'var(--input-bg)', // Menyesuaikan dengan mode gelap/terang
                  border: '1px dashed var(--input-border)',
                  overflow: 'hidden'
                }}
              >
                <span style={{ fontSize: '0.65rem', color: '#888', marginTop: '10px' }}>
                  Sponsor
                </span>
                
                {/* Memanggil AdBanner dengan format fluid khusus untuk In-feed */}
                <AdBanner 
                  dataAdSlot="8411690525" // Pastikan slot ini adalah tipe "In-feed Ads" di AdSense
                  dataAdFormat="fluid" 
                  style={{ width: '100%', height: '100%', margin: '0' }}
                />
              </div>
            );
          }

          // Wajib mengembalikan keranjang (acc) agar proses reduce terus berjalan
          return acc;
        }, [])}
      </div>
    );
  };

  return (
    <div className={styles.novelListWrapper}>
      {renderContent()}
    </div>
  );
}

export default TopicList;