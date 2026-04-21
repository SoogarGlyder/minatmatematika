'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HomeGrid.module.css';
import LoadingSpinner from '../LoadingSpinner';

// ==========================================
// JURUS CACHING SISI KLIEN (IN-MEMORY)
// Menyimpan data tab agar perpindahan menu instan 0 detik!
// ==========================================
const globalGridCache = {};

export default function HomeGrid({ activeTab }) {
  // Jika tab sudah pernah dibuka, langsung tampilkan datanya tanpa loading
  const [items, setItems] = useState(globalGridCache[activeTab] || []);
  const [loading, setLoading] = useState(!globalGridCache[activeTab]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGridData = async () => {
      if (!activeTab) return;

      // Cek Brankas: Kalau data tab ini sudah ada, stop! Jangan fetch ke API lagi.
      if (globalGridCache[activeTab]) {
        setItems(globalGridCache[activeTab]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/grid?tab=${activeTab}`);
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Gagal mengambil data.');
        }

        // Simpan data ke brankas agar jika tab ini diklik lagi, langsung instan
        globalGridCache[activeTab] = result.data;
        setItems(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGridData();
  }, [activeTab]);
  
  if (loading) return <LoadingSpinner message="Menyusun majalah materi..." />;

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--foreground)' }}>
        <p>Waduh, terjadi kesalahan: {error}</p>
      </div>
    );
  }
  
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', opacity: 0.7, color: 'var(--foreground)' }}>
        <p>Belum ada data di kategori ini. Tunggu *update* selanjutnya, ya!</p>
      </div>
    );
  }

  return (
    <div className={styles.masonryWrapper}>
      <div className={styles.masonryGrid}>
        {items.map((item) => (
          <Link 
            key={item._id} 
            href={item.href}
            className={styles.masonryCard}
          >
            {/* Tag/Label kecil di atas gambar untuk membedakan Soal vs Materi */}
            <div className={styles.cardBadge}>
              {item.type === 'paket-soal' ? '📝 Latihan' : '📚 Materi'}
            </div>

            <div className={styles.imageContainer}>
              <Image 
                src={item.image}
                alt={item.title}
                width={500}
                height={500} 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.cardImage}
                priority={false} /* Biarkan false (lazy load) karena ini di dalam grid */
              />
            </div>
            
            <figcaption className={styles.caption}>
              {item.title}
            </figcaption>
          </Link>
        ))}
      </div>
    </div>
  );
}