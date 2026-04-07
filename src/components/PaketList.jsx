'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css'; // Asumsi komponen ini dipakai di dalam Header
import { usePaketList } from '@/hooks/usePaketData';
import LoadingSpinner from './LoadingSpinner';

function PaketList({ activeCategory, onPostClick }) {
  const { posts, loading, error } = usePaketList(activeCategory);

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;

    if (error) return (
      <div className={styles.novelListWrapper} style={{ color: 'red', padding: '20px' }}>
        Error: {error}
      </div>
    );
    
    if (!posts || posts.length === 0) return (
      <div className={styles.novelListWrapper} style={{ color: 'var(--foreground)', opacity: 0.7, padding: '20px' }}>
        Tidak ada paket soal yang ditemukan di materi ini.
      </div>
    );
    
    return (
      <div className={styles.novelGallery}>
        {posts.map((post) => {
          // Format slug dinamis berdasarkan kategorinya
          const catName = post.categories && post.categories.length > 0 ? post.categories[0] : 'umum';
          const categorySlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          const href = `/${categorySlug}/${post.slug}`;
          const coverImage = post.featuredImage || 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop';

          return (
            <Link 
              key={post._id} 
              href={href}
              className={styles.contentCover}
              onClick={onPostClick}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image 
                  src={coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  className={styles.contentCoverImg}
                  priority={false}
                />
              </div>
              <figcaption className={styles.captionLink}>
                {post.title}
              </figcaption>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.novelListWrapper}>
      {renderContent()}
    </div>
  );
}

export default PaketList;