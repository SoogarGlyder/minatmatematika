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

// IMPORT KOMPONEN IKLAN ADSENSE
import AdBanner from '@/components/AdBanner';

// IMPORT KATEX UNTUK MEMBACA RUMUS ($...$)
import katex from 'katex';
import 'katex/dist/katex.min.css';

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

  useEffect(() => {
    if (topic) {
        setPageSerie(topic.category); 
        setDropdownSerie(topic.category);
    }
    setIsListOpen(false); 
    window.scrollTo(0, 0);
  }, [topic, setPageSerie, setDropdownSerie, setIsListOpen]);

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

      if (domNode.attribs && domNode.attribs.class === 'ad-placeholder') {
        const adSlot = domNode.attribs['data-ad-slot'];
        return (
          <div style={{ margin: '30px 0', borderTop: '1px dashed var(--input-border)', borderBottom: '1px dashed var(--input-border)', padding: '20px 0' }}>
            <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '5px' }}>Advertisement</span>
            <AdBanner dataAdSlot={adSlot} />
          </div>
        );
      }
    }
  };

  const contentWithBreaks = (topic.description || '').replace(/\n/g, '');
  
  // IZINKAN TAG TABEL DAN ATRIBUTNYA
  const cleanContent = sanitizeHtml(contentWithBreaks, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 
        'img', 'div', 'span', 'br', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td' // Tag tabel diizinkan
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'img': ['src', 'alt', 'width', 'height', 'title'],
      'div': ['class', 'style', 'id', 'data-ad-slot'], 
      'span': ['class', 'style'],
      'p': ['class', 'style'],
      'table': ['style', 'class', 'width'],
      'thead': ['style', 'class'], 'tbody': ['style', 'class'], 'tr': ['style', 'class'],
      'th': ['style', 'class'], 'td': ['style', 'class']
    },
    allowedSchemes: [ 'http', 'https', 'data', 'mailto' ]
  });

  // FUNGSI UNTUK MERENDER RUMUS LATEX
  const renderLaTeX = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/\$([^\$]+)\$/g, (match, rumus) => {
      try { 
        return katex.renderToString(rumus.replaceAll('&amp;', '&'), { throwOnError: false }); 
      } 
      catch (e) { return match; }
    });
  };

  // Bungkus cleanContent dengan fungsi renderLaTeX
  const finalHtmlContent = renderLaTeX(cleanContent);

  return (
    <div className={styles.holyGrailLayout}>
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
        
        {/* PARSE finalHtmlContent YANG SUDAH DIRENDER LATEX */}
        <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>
          {parse(finalHtmlContent, options)}
        </div>

        <div className={styles.navigation} style={{ marginTop: '20px' }}>
          {lastRead && (
            <div className={styles.lastRead}>
              <Link href={`/${topicSlug}/${lastRead.chapterSlug}`}>
                Lanjut <span>{lastRead.chapterTitle}</span>
              </Link>
            </div>
          )}
          
          {firstPaketSlug && (
             <button 
               onClick={() => router.push(`/${topicSlug}/${firstPaketSlug}`)}
               className={styles.navButton} 
             >
               Mulai &raquo;
             </button>
          )}
        </div>
        <div style={{ margin: '30px 0', borderTop: '1px dashed var(--input-border)', borderBottom: '1px dashed var(--input-border)', padding: '20px 0' }}>
          <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '20px' }}>Advertisement</span>
          <AdBanner dataAdSlot="6974185423" />
        </div>
      </main>
      
      <RightSidebar />
    </div>
  );
}