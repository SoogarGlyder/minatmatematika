// File: src/components/Home/HomeGrid.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTopicList } from '@/hooks/useTopicData'; 
import styles from './HomeGrid.module.css';
import LoadingSpinner from '../LoadingSpinner';

// 1. IMPORT AdBanner ke sini
import AdBanner from '@/components/AdBanner'; 

export default function HomeGrid({ activeSerie }) {
  const { topics, loading, error } = useTopicList(activeSerie);
  
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }
  
  if (!topics || topics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', opacity: 0.7, color: 'var(--foreground)' }}>
        <p>Belum ada materi matematika di kategori ini.</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {topics.map((topic, index) => {
        const href = `/${topic.slug}`; 
        
        // Menentukan kapan iklan muncul (misal: setelah item ke-4, ke-8, ke-12)
        // Ubah angka 4 jika Anda ingin jaraknya lebih dekat atau lebih jauh
        const showAdAfterThis = (index + 1) % 4 === 0;

        return (
          // Gunakan React.Fragment agar kita bisa merender 2 elemen (Link & Iklan) dalam 1 iterasi
          <React.Fragment key={topic._id}>
            
            {/* --- KARTU MATERI ASLI --- */}
            <Link 
              href={href}
              className={styles.card}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image 
                  src={topic.coverImage || 'https://via.placeholder.com/250x350?text=Matematika'}
                  alt={topic.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  className={styles.cardImage}
                  priority={false}
                />
              </div>
              <figcaption className={styles.caption}>
                {topic.title}
              </figcaption>
            </Link>

            {/* --- KARTU IKLAN (Menyelip sebagai Grid Item) --- */}
            {showAdAfterThis && (
              <div 
                className={styles.card}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: 'var(--background-secondary)',
                  overflow: 'hidden'
                }}
              >
                <AdBanner 
                  dataAdSlot="9507873240" 
                  dataAdFormat="fluid"
                  style={{ width: '100%', height: '100%', margin: '0' }}
                />
              </div>
            )}

          </React.Fragment>
        );
      })}
    </div>
  );
}