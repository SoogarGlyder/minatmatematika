// File: src/components/Home/HomeGrid.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Menggunakan hook yang barusan kita ubah namanya
import { useTopicList } from '@/hooks/useTopicData'; 
import styles from './HomeGrid.module.css';
import LoadingSpinner from '../LoadingSpinner';

export default function HomeGrid({ activeSerie }) {
  // activeSerie akan berisi kategori yang dipilih dari Tab (misal: "Penalaran Umum")
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
      {topics.map((topic) => {
        // Link menuju ke detail topik (misal: /matriks)
        const href = `/${topic.slug}`; 
        return (
          <Link 
            key={topic._id} 
            href={href}
            className={styles.card}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image 
                // Menggunakan gambar sampul dari database Topik
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
        );
      })}
    </div>
  );
}