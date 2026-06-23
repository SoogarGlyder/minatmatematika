// File: src/app/[topicSlug]/[packetSlug]/PacketClient.jsx
'use client';

import React, { useState, useEffect } from 'react';
// 1. HAPUS useSearchParams, cukup gunakan useRouter dan usePathname
import { useRouter, usePathname } from 'next/navigation';
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

import katex from 'katex';
import 'katex/dist/katex.min.css';
import AdBanner from '@/components/AdBanner';

export default function PacketClient({
  topic, packet, allPackets, prevPacket, nextPacket 
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { setPageSerie } = useGlobalContext();
  const { fontSize } = useFontSize(); 
  const [isListVisible, setIsListVisible] = useState(false);

  // --- STATE SYSTEM CBT SIMULATOR ---
  // 2. KUNCI: Membaca dari ujung URL, apakah berakhiran '/cbt'?
  const isCbtMode = pathname.endsWith('/cbt'); 
  
  const [cbtQuestions, setCbtQuestions] = useState([]);
  const [currentCbtIndex, setCurrentCbtIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [isCbtSubmitted, setIsCbtSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  
  const topicSlug = topic.slug;
  const packetSlug = packet.paket_slug;
  const { topics: categoryTopics } = useTopicList(topic.category);

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [packet]);

  useEffect(() => {
    if (typeof window !== 'undefined') setIsListVisible(window.innerWidth > 767);
    const handleResize = () => setIsListVisible(window.innerWidth > 767);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (topic && topic.category) setPageSerie(topic.category);
    if (packet && topic) saveReadingHistory(topic.slug, packet.paket_slug, packet.title, packet.paket_number);
  }, [topic, packet, setPageSerie]);

  // ENGINE POTONG HTML
  useEffect(() => {
    if (packet?.content) {
      const tokens = packet.content.split(/(?=<h3.*?>Nomor \d+<\/h3>)/g);
      const filteredQuestions = [];

      tokens.forEach((token) => {
        if (token.includes('<h3>') || token.includes('<h3 ')) {
          const ansMatch = token.match(/Jawaban:\s*<strong>([A-E])<\/strong>/i) || token.match(/<strong>Jawaban:\s*([A-E])<\/strong>/i);
          const correctAnswer = ansMatch ? ansMatch[1].toUpperCase() : '';
          
          let cleanedHtml = token;
          const detailsEndIndex = token.lastIndexOf('</details>');
          if (detailsEndIndex !== -1) cleanedHtml = token.substring(0, detailsEndIndex + 10);
          
          filteredQuestions.push({ htmlContent: cleanedHtml, correctKey: correctAnswer });
        }
      });
      setCbtQuestions(filteredQuestions);
    }
  }, [packet]);
  
  if (!packet || !topic) return null;

  const wordCount = packet.content ? packet.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 150); 

  const options = {
    replace: (domNode) => {
      if (domNode.type === 'tag' && domNode.name === 'img') {
        const { src, alt } = domNode.attribs;
        return (
          <div className={styles.optimizedImageWrapper}>
            <Image src={src} alt={alt || 'Ilustrasi Soal'} width={0} height={0} sizes="(max-width: 768px) 100vw, 800px" style={{ width: '100%', height: 'auto' }} loading="lazy" quality={85} />
          </div>
        );
      }
      if (domNode.attribs && domNode.attribs.class === 'chapter-image-center') {
         return <div className={styles.imageContainer}>{domToReact(domNode.children, options)}</div>;
      }
      if (domNode.attribs && domNode.attribs.class === 'ad-placeholder') {
        const adSlot = domNode.attribs['data-ad-slot']; 
        return (
          <div style={{ margin: '0', borderTop: '2px dashed var(--input-border)', borderBottom: '2px dashed var(--input-border)', padding: '20px 0' }}>
            <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '20px' }}>Advertisement</span>
            <AdBanner dataAdSlot={adSlot} />
          </div>
        );
      }
      if (isCbtMode) {
        if (!isCbtSubmitted && domNode.name === 'details') return <></>; 
        if (domNode.name === 'hr') return <></>;
      }
    }
  };

  const cleanContent = sanitizeHtml((packet.content || '').replace(/\n/g, ''), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'div', 'span', 'br', 'hr', 'details', 'summary' ]),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'width', 'height', 'title'],
        'div': ['class', 'style', 'id', 'data-ad-slot'],
        'span': ['class', 'style', 'id'],
        'ul': ['class', 'style', 'id'], 'ol': ['class', 'style', 'id'], 'li': ['class', 'style', 'id'],
        'h1': ['class', 'style', 'id'], 'h2': ['class', 'style', 'id'], 'h3': ['class', 'style', 'id'],
        'hr': ['class', 'style', 'id'], 'br': ['class', 'style', 'id'], 'p': ['class', 'style', 'id'],
        'a': ['href', 'target', 'id'], 'details': ['style', 'class', 'open'], 'summary': ['style', 'class'] 
    },
    allowedSchemes: [ 'http', 'https', 'data', 'mailto' ]
  });

  const renderLaTeX = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/\$([^\$]+)\$/g, (match, rumus) => {
      try { return katex.renderToString(rumus.replaceAll('&amp;', '&'), { throwOnError: false }); } 
      catch (e) { return match; }
    });
  };

  const finalHtmlContent = renderLaTeX(cleanContent);

  const handleSelectAnswer = (option) => {
    if (isCbtSubmitted) return;
    setUserAnswers({ ...userAnswers, [currentCbtIndex]: option });
  };

  const handleSubmitCbt = () => {
    if (window.confirm('Apakah Anda yakin ingin mengakhiri dan mengoreksi try out ini?')) {
      let correctCount = 0;
      cbtQuestions.forEach((q, idx) => { if (userAnswers[idx] === q.correctKey) correctCount++; });
      setScore(Math.round((correctCount / cbtQuestions.length) * 100));
      setIsCbtSubmitted(true);
      setShowScoreModal(true); 
      setCurrentCbtIndex(0); 
    }
  };

  const handleResetCbt = () => {
    setUserAnswers({}); 
    setIsCbtSubmitted(false); 
    setScore(0); 
    setCurrentCbtIndex(0);
    setShowScoreModal(false);
  };

  // --- 3. KUNCI: Fungsi Toggle URL Menggunakan Path ---
  const toggleCbtMode = () => {
    if (isCbtMode) {
      if (window.confirm('Apakah Anda yakin ingin membatalkan ujian dan kembali ke Mode Baca?')) {
        handleResetCbt();
        router.push(pathname.replace(/\/cbt$/, '')); 
      }
    } else {
      window.location.href = `${pathname}/cbt`;
    }
  };

  return (
    <div className={styles.holyGrailLayout}>

      {/* MODAL POP UP SKOR PASCA UJIAN TETAP ADA */}
      {showScoreModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ margin: '0 0 15px 0' }}>Skor Try Out Anda</h3>
            <div className={styles.scoreCircle} style={{ margin: '0 auto 20px auto' }}>{score}</div>
            <p style={{ fontSize: '0.9rem', marginBottom: '25px', opacity: 0.9 }}>
              Ujian selesai! Silakan tutup pesan ini jika Anda ingin melihat kunci jawaban dan meninjau pembahasan dari setiap soal.
            </p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowScoreModal(false)} className={styles.closeModalBtn}>Tinjau Pembahasan</button>
              <button onClick={handleResetCbt} className={styles.resetModalBtn}>Ulangi Ujian</button>
            </div>
          </div>
        </div>
      )}

       {/* SIDEBAR KIRI TETAP HILANG SAAT MODE CBT */}
       {!isCbtMode && (
         <aside className={styles.leftSidebar}>
            <button className={styles.mobileToggle} onClick={() => setIsListVisible(!isListVisible)}>Daftar Paket {isListVisible ? '▴' : '▾'}</button>
            <h2 className={styles.leftSidebarTitle}>Daftar Paket Soal</h2>
            {isListVisible && (
                <ul className={styles.chapterList}>
                  <li><Link href={`/${topicSlug}`} className={styles.chapterLink}>Deskripsi Materi</Link></li>
                  {allPackets.map((item) => (
                    <li key={item._id}>
                      <Link href={`/${topicSlug}/${item.paket_slug}`} className={`${styles.chapterLink} ${item.paket_slug === packetSlug ? styles.activeChapter : ''}`}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
            )}
        </aside>
       )}

      {/* AREA UTAMA SOAL */}
      <main className={styles.mainContent}>
            <Breadcrumbs items={[{ label: topic.title, link: `/${topicSlug}` }, { label: packet.title, link: null }]} />
            <div className={styles.chapterHeader}>
              <div>
                <h1>{topic.title}</h1>
                <h2>{packet.title}</h2>
              </div>

              <div className={styles.singleToggleContainer}>
                {/* Tombol memanggil toggleCbtMode yang mengubah URL */}
                <button 
                  onClick={toggleCbtMode} 
                  className={`${styles.toggleBtn} ${isCbtMode ? styles.toggleBtnActive : ''}`}
                >
                  {isCbtMode ? 'Mode CBT: ON' : 'Mode CBT: OFF'}
                </button>
              </div>
            </div>
            <hr className={styles.divider} />

            {isCbtMode ? (
              <div className={styles.cbtSimulatorLayout}>
                <div className={styles.cbtWorkspace}>
                  {/* WORKSPACE SOAL AKTIF */}
                  <div className={styles.cbtQuestionBox}>
                    <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>
                      {cbtQuestions[currentCbtIndex] ? parse(renderLaTeX(cbtQuestions[currentCbtIndex].htmlContent), options) : <p>Memuat soal...</p>}
                    </div>

                    <div className={styles.cbtAnswerSelector}>
                      <p className={styles.selectorLabel}>Pilih Lembar Jawaban Anda:</p>
                      <div className={styles.optionButtonGroup}>
                        {['A', 'B', 'C', 'D', 'E'].map((opt) => {
                          const isSelected = userAnswers[currentCbtIndex] === opt;
                          const isCorrectKey = cbtQuestions[currentCbtIndex]?.correctKey === opt;
                          let btnStyle = styles.optBtn;
                          if (isSelected) btnStyle = styles.optBtnSelected;
                          if (isCbtSubmitted && isCorrectKey) btnStyle = styles.optBtnCorrectKey;

                          return (
                            <button key={opt} onClick={() => handleSelectAnswer(opt)} className={btnStyle} disabled={isCbtSubmitted}>
                              <span className={styles.optLetter}>{opt}</span>
                            </button>
                          );
                        })} 
                      </div>
                    </div>

                    <div className={styles.cbtFooterNav}>
                      <button onClick={() => setCurrentCbtIndex(prev => Math.max(0, prev - 1))} disabled={currentCbtIndex === 0} className={styles.navCbtBtn}>
                        « Sebelumnya
                      </button>
                      {!isCbtSubmitted ? (
                        currentCbtIndex === cbtQuestions.length - 1 ? (
                          <button onClick={handleSubmitCbt} className={styles.submitCbtBtn}>Selesai</button>
                        ) : (
                          <button onClick={() => setCurrentCbtIndex(prev => Math.min(cbtQuestions.length - 1, prev + 1))} disabled={currentCbtIndex === cbtQuestions.length - 1} className={styles.navCbtBtn}>
                            Selanjutnya »
                          </button>
                        )
                      ) : (
                        currentCbtIndex === cbtQuestions.length - 1 ? (
                          <button onClick={handleResetCbt} className={styles.submitCbtBtn} style={{ background: '#374151' }}>🔄 Ulangi Ujian</button>
                        ) : (
                          <button onClick={() => setCurrentCbtIndex(prev => Math.min(cbtQuestions.length - 1, prev + 1))} disabled={currentCbtIndex === cbtQuestions.length - 1} className={styles.navCbtBtn}>
                            Selanjutnya »
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div style={{ paddingTop: '20px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '20px' }}>Advertisement</span>
                    <AdBanner dataAdSlot="4564146092" />
                  </div>
                </div>

                <div className={styles.mobileCbtGrid}>
                  {cbtQuestions.map((_, idx) => {
                    const hasAnswered = userAnswers[idx] !== undefined;
                    const isCurrent = currentCbtIndex === idx;

                    let tileStyle = styles.mobileGridTile;
                    if (hasAnswered) tileStyle += ` ${styles.mobileGridTileAnswered}`;
                    if (isCurrent) tileStyle += ` ${styles.mobileGridTileCurrent}`;
                    
                    if (isCbtSubmitted) {
                      const isTileCorrect = userAnswers[idx] === cbtQuestions[idx].correctKey;
                      tileStyle += isTileCorrect ? ` ${styles.mobileGridTileCorrect}` : ` ${styles.mobileGridTileWrong}`;
                      if (isCurrent) tileStyle += ` ${styles.mobileGridTileCurrentReview}`;
                    }

                    return (
                      <button key={`mob-grid-${idx}`} onClick={() => setCurrentCbtIndex(idx)} className={tileStyle}>
                        {idx + 1}
                        <span className={styles.miniLabel}>{userAnswers[idx] || '-'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VIEW MODE BACA */
              <>
                <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginBottom: '35px', marginTop: '-15px' }}>
                  Estimasi waktu pengerjaan: {readingTime} menit
                </span>
                <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>{parse(finalHtmlContent, options)}</div>
                <div style={{ margin: '30px 0', borderTop: '1px dashed var(--input-border)', paddingTop: '20px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '20px' }}>Advertisement</span>
                  <AdBanner dataAdSlot="4564146092" />
                </div>
              </>
            )}

            {!isCbtMode && (
              <div className={styles.navigation}>
                <button onClick={() => { prevPacket ? router.push(`/${topicSlug}/${prevPacket.paket_slug}`) : router.push(`/${topicSlug}`) }}>
                  {prevPacket ? '« Paket Sebelumnya' : '« Deskripsi Materi'}
                </button>
                <button onClick={() => {
                  if (nextPacket) { router.push(`/${topicSlug}/${nextPacket.paket_slug}`); } 
                  else {
                    if (categoryTopics && categoryTopics.length > 0) {
                      const idx = categoryTopics.findIndex(n => n.slug === topicSlug);
                      router.push(idx !== -1 && idx < categoryTopics.length - 1 ? `/${categoryTopics[idx + 1].slug}` : '/');
                    } else router.push('/');
                  }
                }}>
                  {nextPacket ? 'Paket Selanjutnya »' : 'Materi Selanjutnya »'}
                </button>
              </div>
            )}
            
            <CommentSection topicSlug={topicSlug} paketSlug={packetSlug} />
      </main>
      
      <RightSidebar 
        isCbtMode={isCbtMode}
        cbtProps={{
          cbtQuestions,
          currentCbtIndex,
          userAnswers,
          isCbtSubmitted,
          setCurrentCbtIndex
        }}
      />
    </div>
  );
}