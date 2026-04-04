'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFontSize } from '@/contexts/FontSizeContext'; 
import styles from './PaketReadPage.module.css';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useGlobalContext } from '@/app/providers'; 
import { saveReadingHistory } from '@/utils/readingHistory';
import RightSidebar from '@/components/RightSidebar';
import MathContent from '@/components/MathContent';

export default function PaketClient({
  kategoriSlug,
  categoryName,
  post, 
  allPosts, 
  prevPost, 
  nextPost 
}) {
  const router = useRouter();
  const { setPageCategory } = useGlobalContext();
  const { fontSize } = useFontSize(); 
  const [isListVisible, setIsListVisible] = useState(false);
  
  const postSlug = post.slug;

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    } 
  }, [post]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth > 767) {
        setIsListVisible(true);
      }
    }

    const handleResize = () => {
      setIsListVisible(window.innerWidth > 767);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (categoryName) {
      setPageCategory(categoryName);
    }

    if (post && kategoriSlug) {
       saveReadingHistory(
          kategoriSlug,
          post.slug,
          post.title
       );
    }
  }, [categoryName, post, kategoriSlug, setPageCategory]);
  
  if (!post) return null;

  const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 150); // Penyesuaian waktu baca matematika

  return (
    <div className={styles.holyGrailLayout}>
       <aside className={styles.leftSidebar}>
          <button
          className={styles.mobileToggle}
          onClick={() => setIsListVisible(!isListVisible)}>
          Daftar Paket {isListVisible ? '▴' : '▾'}
        </button>

        <h2 className={styles.leftSidebarTitle}>
           Daftar Paket
        </h2>
        
        {isListVisible && (
            <ul className={styles.chapterList}>
              <li>
                <Link href={`/${kategoriSlug}`} className={styles.chapterLink}>
                  Deskripsi Materi
                </Link>
              </li>
              {allPosts.map((item) => (
                <li key={item._id}>
                  <Link 
                    href={`/${kategoriSlug}/${item.slug}`}
                    className={`${styles.chapterLink} ${
                      item.slug === postSlug ? styles.activeChapter : ''
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
        )}
      </aside>

      <main className={styles.mainContent}>
            <Breadcrumbs 
              items={[
                { label: categoryName, link: `/${kategoriSlug}` }, 
                { label: post.title, link: null }
              ]} 
            />
            <div className={styles.chapterHeader}>
              <h1>{categoryName}</h1>
              <h2>{post.title}</h2>
              <span style={{ fontSize: '0.9rem', color: '#888' }}>
                Estimasi waktu belajar: {readingTime} menit
              </span>
            </div>
            
            <hr className={styles.divider} />
            <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>
               {/* Konten Matematika di-render di sini */}
               <MathContent content={post.content} />
            </div>

            <div className={styles.navigation}>
              <button 
                onClick={() => {
                  if (prevPost) router.push(`/${kategoriSlug}/${prevPost.slug}`);
                  else router.push(`/${kategoriSlug}`);
                }}
              >
                {prevPost ? '« Paket Sebelumnya' : '« Deskripsi Materi'}
              </button>

              <button 
                onClick={() => {
                  if (nextPost) {
                    router.push(`/${kategoriSlug}/${nextPost.slug}`);
                  } else {
                    router.push('/');
                  }
                }}
              >
                {nextPost ? 'Paket Selanjutnya »' : 'Kembali ke Beranda »'}
              </button>
            </div>
            
            <div className={styles.disclaimer}>
              <p>
                <strong>Catatan Belajar:</strong> Pahami konsep dasar sebelum melihat pembahasan. 
                Gunakan tombol + dan - di sidebar kanan untuk menyesuaikan ukuran teks rumus.
              </p>
            </div>

      </main>
      <RightSidebar 
        affiliateData={{
          title: "Buku Panduan UTBK",
          link: "#",
          image: "https://via.placeholder.com/250x350"
        }} 
      />
    </div>
  );
}