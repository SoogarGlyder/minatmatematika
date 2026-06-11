// File: src/components/TopicList.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { useTopicList } from '../hooks/useTopicData';
import LoadingSpinner from './LoadingSpinner';

// 1. IMPORT KOMPONEN IKLAN
import AdBanner from './AdBanner';

function TopicList({ activeSerie, onNovelClick }) {
  const { topics, loading, error } = useTopicList(activeSerie);

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;

    if (error) return (
      <div className={styles.novelListWrapper} style={{ color: 'var(--foreground)', padding: '20px' }}>
        Error: {error}
      </div>
    );
    
    if (!topics || topics.length === 0) return (
      <div className={styles.novelListWrapper} style={{ color: 'var(--foreground)', padding: '20px' }}>
        Tidak ada materi yang ditemukan.
      </div>
    );
    
    return (
      <div className={styles.novelGallery}>
        {/* 2. MENGGUNAKAN REDUCE UNTUK MENYISIPKAN IKLAN */}
        {topics.reduce((acc, topic, index) => {
          const href = `/${topic.slug}`;
          
          // A. Memasukkan Kartu Materi Asli ke dalam grid
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

          // B. Memasukkan Kartu Iklan setiap 4 materi (bisa disesuaikan angkanya)
          // Menggunakan sisa bagi (modulo) % 4
          if ((index + 1) % 4 === 0) {
            acc.push(
              <div 
                key={`ad-${index}`} 
                className={styles.contentCover} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: 'var(--input-bg)',
                  border: '1px dashed var(--input-border)',
                  overflow: 'hidden'
                }}
              >
                <span style={{ fontSize: '0.65rem', color: '#888', marginTop: '10px' }}>Sponsor</span>
                {/* Kamu bisa menggunakan dataAdFormat="fluid" khusus untuk in-feed ads */}
                <AdBanner 
                  dataAdSlot="8411690525" 
                  dataAdFormat="fluid" 
                />
              </div>
            );
          }

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