'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFontSize } from '@/contexts/FontSizeContext'; 
import styles from './KategoriDetailPage.module.css';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useGlobalContext } from '@/app/providers';
import { getReadingHistory } from '@/utils/readingHistory';
import RightSidebar from '@/components/RightSidebar';
import MathContent from '@/components/MathContent'; // <-- IMPORT MATHCONTENT

export default function KategoriClient({ category, allPosts }) {
  const router = useRouter();
  const { setPageCategory, setDropdownCategory, setIsListOpen } = useGlobalContext();
  const { fontSize } = useFontSize();
  const [isListVisible, setIsListVisible] = useState(false);
  const [lastRead, setLastRead] = useState(null);

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
    if (category) {
        setPageCategory(category.name);
        setDropdownCategory(category.name);
    }
    setIsListOpen(false); 
    window.scrollTo(0, 0);
  }, [category, setPageCategory, setDropdownCategory, setIsListOpen]);

  useEffect(() => {
    if (category && category.slug) {
      const historyData = getReadingHistory(category.slug);
      if (historyData) {
        setLastRead(historyData);
      }
    }
  }, [category]);
  
  if (!category) return null;

  const firstPostSlug = allPosts.length > 0 ? allPosts[0].slug : null;

  return (
    <div className={styles.holyGrailLayout}>
      
      {/* SIDEBAR KIRI */}
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
              <Link 
                href={`/${category.slug}`} 
                className={`${styles.chapterLink} ${styles.activeChapter}`}
              >
                Deskripsi Materi
              </Link>
            </li>
            {allPosts.map((postItem) => (
              <li key={postItem._id}>
                <Link 
                  href={`/${category.slug}/${postItem.slug}`}
                  className={styles.chapterLink}
                >
                  {postItem.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* MAIN CONTENT TENGAH */}
      <main className={styles.mainContent}>
        <Breadcrumbs 
          items={[
            { label: category.name, link: `/${category.slug}` }, 
            { label: `Deskripsi Materi`, link: null } 
          ]} 
        />
        <div className={styles.chapterHeader}>
          <h1>{category.name}</h1>
          <h2>Deskripsi Materi</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>
            Total {allPosts.length} Paket Soal Tersedia
          </span>
        </div>
        <hr className={styles.divider} />
        
        <div className={`${styles.content} global-content`} style={{ fontSize: `${fontSize}px` }}>
          <MathContent content={category.description} />
        </div>

        <div className={styles.navigation}>
          
          {/* KOTAK HISTORI BELAJAR */}
          {lastRead && (
            <div className={styles.lastRead}>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', marginRight: '20px' }}>
                  Terakhir dipelajari:
                </span>
                <strong>
                  {lastRead.paketTitle}
                </strong>
              </div>
              <Link href={`/${category.slug}/${lastRead.paketSlug}`}>
                Lanjut Belajar »
              </Link>
            </div>
          )}
          
          {firstPostSlug && (
             <button 
               onClick={() => router.push(`/${category.slug}/${firstPostSlug}`)}
               style={{
                 background: 'var(--primary)',
                 color: 'var(--background)',
                 padding: '10px 20px',
                 border: 'none',
                 borderRadius: '6px',
                 cursor: 'pointer',
                 fontWeight: 'bold'
               }}
             >
               Paket Pertama &raquo;
             </button>
          )}
        </div>

        <div className={styles.disclaimer}>
          <p>
            <strong>Petunjuk Belajar:</strong> Pahami setiap langkah pembahasan yang diberikan. 
            Gunakan tombol pengatur font di sebelah kanan jika rumus terlihat terlalu kecil.
          </p>
        </div>
      </main>

      {/* SIDEBAR KANAN */}
      <RightSidebar 
        affiliateData={{
          title: "Buku Strategi Tembus UTBK",
          link: "#",
          image: "https://via.placeholder.com/250x350"
        }} 
      />
    </div>
  );
}