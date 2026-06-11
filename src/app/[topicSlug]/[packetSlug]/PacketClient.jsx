// File: src/app/[topicSlug]/[packetSlug]/PacketClient.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import parse, { domToReact } from 'html-react-parser';
import sanitizeHtml from 'sanitize-html';
import { useFontSize } from '@/contexts/FontSizeContext'; 
import styles from './PacketReadPage.module.css'; 
import { useTopicList } from '@/hooks/useTopicData';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useGlobalContext } from '@/app/providers'; 
import { saveReadingHistory } from '@/utils/readingHistory';
import CommentSection from '@/components/CommentSection';
import RightSidebar from '@/components/RightSidebar';

// 1. IMPORT MESIN RUMUS MATEMATIKA
import katex from 'katex';
import 'katex/dist/katex.min.css';

// 2. IMPORT KOMPONEN IKLAN ADSENSE
import AdBanner from '@/components/AdBanner';

export default function PacketClient({
  topic, 
  packet, 
  allPackets, 
  prevPacket, 
  nextPacket 
}) {
  const router = useRouter();
  const { setPageSerie } = useGlobalContext();
  const { fontSize } = useFontSize(); 
  const [isListVisible, setIsListVisible] = useState(false);
  
  const topicSlug = topic.slug;
  const packetSlug = packet.paket_slug;
  
  const { topics: categoryTopics } = useTopicList(topic.category);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    } 
  }, [packet]);

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
    if (topic && topic.category) {
      setPageSerie(topic.category);
    }
    if (packet && topic) {
       saveReadingHistory(
          topic.slug,
          packet.paket_slug,
          packet.title,
          packet.paket_number
       );
    }
  }, [topic, packet, setPageSerie]);
  
  if (!packet || !topic) return null;

  const wordCount = packet.content ? packet.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 150); 

  const options = {
    replace: (domNode) => {
      if (domNode.type === 'tag' && domNode.name === 'img') {
        const { src, alt } = domNode.attribs;
        return (
          <div className={styles.optimizedImageWrapper}>
            <Image 
              src={src}
              alt={alt || 'Ilustrasi Soal'}
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

  const contentWithBreaks = (packet.content || '').replace(/\n/g, '');
  
  const cleanContent = sanitizeHtml(contentWithBreaks, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'div', 'span', 'br', 'hr', 'details', 'summary' ]),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'width', 'height', 'title'],
        'div': ['class', 'style', 'id'],
        'span': ['class', 'style', 'id'],
        'h1': ['class', 'style', 'id'],
        'h2': ['class', 'style', 'id'],
        'h3': ['class', 'style', 'id'],
        'h4': ['class', 'style', 'id'],
        'h5': ['class', 'style', 'id'],
        'h6': ['class', 'style', 'id'],
        'hr': ['class', 'style', 'id'],
        'br': ['class', 'style', 'id'],
        'p': ['class', 'style', 'id'],
        'a': ['href', 'target', 'id'],
        'details': ['style', 'class', 'open'], 
        'summary': ['style', 'class'] 
    },
    allowedSchemes: [ 'http', 'https', 'data', 'mailto' ]
  });

  const renderLaTeX = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/\$([^\$]+)\$/g, (match, rumus) => {
      try {
         return katex.renderToString(rumus, { throwOnError: false });
      } catch (e) {
         return match;
      }
    });
  };

  const finalHtmlContent = renderLaTeX(cleanContent);

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
           Daftar Paket Soal
        </h2>
        
        {isListVisible && (
            <ul className={styles.chapterList}>
              <li>
                <Link href={`/${topicSlug}`} className={styles.chapterLink}>
                  Deskripsi Materi
                </Link>
              </li>
              {allPackets.map((item) => (
                <li key={item._id}>
                  <Link 
                    href={`/${topicSlug}/${item.paket_slug}`}
                    className={`${styles.chapterLink} ${
                      item.paket_slug === packetSlug ? styles.activeChapter : ''
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
        )}
      </aside>

      {/* AREA UTAMA SOAL */}
      <main className={styles.mainContent}>
            <Breadcrumbs 
              items={[
                { label: topic.title, link: `/${topicSlug}` }, 
                { label: packet.title, link: null }
              ]} 
            />
            <div className={styles.chapterHeader}>
              <h1>{topic.title}</h1>
              <h2>{packet.title}</h2>
              <span style={{ fontSize: '0.9rem', color: '#888' }}>
                Estimasi waktu pengerjaan: {readingTime} menit
              </span>
            </div>
            
            <hr className={styles.divider} />

            {/* TAMPILKAN KONTEN FINAL YANG SUDAH JADI RUMUS */}
            <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>
               {parse(finalHtmlContent, options)}
            </div>

            {/* 3. IKLAN ADSENSE DITEMPATKAN DI SINI (SEBELUM TOMBOL NAVIGASI) */}
            <div style={{ margin: '30px 0', borderTop: '1px dashed var(--input-border)', paddingTop: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '5px' }}>Advertisement</span>
              <AdBanner dataAdSlot="4564146092" />
            </div>

            {/* TOMBOL NAVIGASI BAWAH */}
            <div className={styles.navigation}>
              <button 
                onClick={() => {
                  if (prevPacket) router.push(`/${topicSlug}/${prevPacket.paket_slug}`);
                  else router.push(`/${topicSlug}`);
                }}
              >
                {prevPacket ? '« Paket Sebelumnya' : '« Deskripsi Materi'}
              </button>

              <button 
                onClick={() => {
                  if (nextPacket) {
                    router.push(`/${topicSlug}/${nextPacket.paket_slug}`);
                  } else {
                    if (categoryTopics && categoryTopics.length > 0) {
                      const idx = categoryTopics.findIndex(n => n.slug === topicSlug);
                      if (idx !== -1 && idx < categoryTopics.length - 1) {
                         router.push(`/${categoryTopics[idx + 1].slug}`);
                      } else {
                         router.push('/');
                      }
                    } else {
                      router.push('/');
                    }
                  }
                }}
              >
                {nextPacket ? 'Paket Selanjutnya »' : 'Materi Selanjutnya »'}
              </button>
            </div>
            
            {/* KOMENTAR */}
            <CommentSection 
              topicSlug={topicSlug} 
              paketSlug={packetSlug} 
            />
      </main>
      <RightSidebar />
    </div>
  );
}