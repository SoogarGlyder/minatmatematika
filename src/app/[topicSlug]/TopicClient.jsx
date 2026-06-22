// File: src/app/[topicSlug]/TopicClient.jsx
'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import parse, { domToReact } from 'html-react-parser';
import sanitizeHtml from 'sanitize-html';
import { useFontSize } from '@/contexts/FontSizeContext'; 
import styles from './TopicDetailPage.module.css'; 
import Breadcrumbs from '../../components/Breadcrumbs';
import { useGlobalContext } from '../providers';
import { getReadingHistory } from '../../utils/readingHistory';
import RightSidebar from '@/components/RightSidebar';

// 1. IMPORT KOMPONEN IKLAN ADSENSE
import AdBanner from '@/components/AdBanner';

export default function TopicClient({ initialTopic, initialPaketList }) {
  const router = useRouter();
  const { setPageSerie, setDropdownSerie, setIsListOpen } = useGlobalContext();
  const { fontSize } = useFontSize();
  const [isListVisible, setIsListVisible] = useState(false);
  const [lastRead, setLastRead] = useState(null);

  const topic = initialTopic;
  const allPaket = initialPaketList || [];
  const topicSlug = topic.slug;

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

  // Menyimpan kategori agar menu Header di atas ikut menyala
  useEffect(() => {
    if (topic) {
        setPageSerie(topic.category); 
        setDropdownSerie(topic.category);
    }
    setIsListOpen(false); 
    window.scrollTo(0, 0);
  }, [topic, setPageSerie, setDropdownSerie, setIsListOpen]);

  // Mengambil riwayat belajar terakhir
  useEffect(() => {
    if (topicSlug) {
      const historyData = getReadingHistory(topicSlug);
      if (historyData) {
        setLastRead(historyData);
      }
    }
  }, [topicSlug]);
  
  if (!topic) return null;

  const firstPaketSlug = allPaket.length > 0 ? allPaket[0].paket_slug : null;

  const options = {
    replace: (domNode) => {
      if (domNode.type === 'tag' && domNode.name === 'img') {
        const { src, alt } = domNode.attribs;
        return (
          <div className={styles.optimizedImageWrapper}>
            <Image 
              src={src}
              alt={alt || 'Ilustrasi Materi'}
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 800px"
              style={{ width: '100%', height: 'auto' }}
              loading="lazy"
              quality={85}
            />
          </div>
        );
      }
      
      if (domNode.attribs && domNode.attribs.class === 'chapter-image-center') {
         return (
             <div className={styles.imageContainer}>
                 {domToReact(domNode.children, options)}
             </div>
         );
      }
    }
  };

  const contentWithBreaks = (topic.description || '').replace(/\n/g, '');
  const cleanContent = sanitizeHtml(contentWithBreaks, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'div', 'span', 'br', 'hr' ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'img': ['src', 'alt', 'width', 'height', 'title'],
      'div': ['class', 'style', 'id'],
      'span': ['class', 'style'],
      'p': ['class', 'style']
    },
    allowedSchemes: [ 'http', 'https', 'data', 'mailto' ]
  });

  return (
    <div className={styles.holyGrailLayout}>
      {/* SIDEBAR KIRI: Daftar Paket Soal */}
      <aside className={styles.leftSidebar}>
        <button
          className={styles.mobileToggle}
          onClick={() => setIsListVisible(!isListVisible)}>
            Daftar Paket Soal {isListVisible ? '▴' : '▾'}
        </button>
        
        <h2 className={styles.leftSidebarTitle}>
           Daftar Paket Soal
        </h2>

        {isListVisible && (
          <ul className={styles.chapterList}>
            <li>
              <Link 
                href={`/${topicSlug}`} 
                className={`${styles.chapterLink} ${styles.activeChapter}`}
              >
              Deskripsi Materi
              </Link>
            </li>
            {allPaket.map((paketItem) => (
              <li key={paketItem._id}>
                <Link 
                  href={`/${topicSlug}/${paketItem.paket_slug}`}
                  className={styles.chapterLink}
                >
                  {paketItem.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* KONTEN UTAMA: Deskripsi Materi */}
      <main className={styles.mainContent}>
        <Breadcrumbs 
          items={[
            { label: topic.title, link: `/${topicSlug}` }, 
            { label: `Deskripsi`, link: null } 
          ]} 
        />
        <div className={styles.chapterHeader}>
          <h1>{topic.title}</h1>
          <h2>Deskripsi Materi</h2>
        </div>
        <hr className={styles.divider} />
        
        <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>
          {parse(cleanContent, options)}
        </div>

        {/* 2. IKLAN ADSENSE DITEMPATKAN DI SINI */}
        <div style={{ margin: '30px 0', borderTop: '1px dashed var(--input-border)', borderBottom: '1px dashed var(--input-border)', padding: '20px 0' }}>
          <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '20px' }}>Advertisement</span>
          <AdBanner dataAdSlot="6974185423" />
        </div>

        {/* NAVIGASI: Tombol Mulai Belajar */}
        <div className={styles.navigation} style={{ marginTop: '20px' }}>
          {lastRead && (
            <div className={styles.lastRead}>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', marginRight: '20px' }}>
                  Terakhir dipelajari:
                </span>
                <strong>
                  {lastRead.chapterTitle}
                </strong>
              </div>
              <Link href={`/${topicSlug}/${lastRead.chapterSlug}`}>
                Lanjut Belajar »
              </Link>
            </div>
          )}
          
          {firstPaketSlug && (
             <button 
               onClick={() => router.push(`/${topicSlug}/${firstPaketSlug}`)}
               className={styles.navButton} 
             >
               Mulai Latihan &raquo;
             </button>
          )}
        </div>

        {/* DISCLAIMER BAWAH */}
        <div className={styles.disclaimer}>
          <p>
            <strong>Disclaimer:</strong> Materi dan soal yang disajikan di platform ini ditujukan sebagai sarana pembelajaran dan latihan mandiri untuk membantu memahami konsep matematika.
          </p>
        </div>
      </main>
      
      <RightSidebar />
    </div>
  );
}