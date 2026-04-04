'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HomeGrid.module.css';

export default function HomeGrid({ posts }) {
  
  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', opacity: 0.7, color: 'var(--foreground)' }}>
        <p>Belum ada paket soal di kategori ini.</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {posts.map((post) => {
        // Ambil nama kategori untuk membuat routing yang benar
        const catName = post.categories && post.categories.length > 0 ? post.categories[0] : 'umum';
        const categorySlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const href = `/${categorySlug}/${post.slug}`; 
        const coverImage = post.featuredImage || 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop';

        return (
          <Link 
            key={post._id} 
            href={href}
            className={styles.card}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image 
                src={coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                className={styles.cardImage}
                priority={false}
              />
            </div>
            <figcaption className={styles.caption}>
              {post.title}
            </figcaption>
          </Link>
        );
      })}
    </div>
  );
}