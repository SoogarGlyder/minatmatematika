// File: src/app/[topicSlug]/[packetSlug]/PacketClient.jsx
'use client';

import React, { useState, useEffect } from 'react';
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

  const isCbtMode = pathname.startsWith('/cbt'); 
  
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

  // ENGINE POTONG HTML (SUPERCHARGED: PGK & INTERACTIVE A-E OPTIONS)
  useEffect(() => {
    if (packet?.content) {
      const tokens = packet.content.split(/(?=<h3.*?>Nomor \d+<\/h3>)/g);
      const filteredQuestions = [];
      let rawSupportText = '';

      tokens.forEach((token) => {
        if (!token.match(/<h3.*?>Nomor \d+<\/h3>/i)) {
          rawSupportText += token; 
          return; 
        }

        if (token.match(/<h3.*?>Nomor \d+<\/h3>/i)) {
          let validSupportText = '';
          if (rawSupportText.match(/teks\s+(pendukung|\d+)/i)) {
             validSupportText = rawSupportText; 
          }

          const ansMatch = token.match(/Jawaban:\s*<strong>([A-E])<\/strong>/i) || token.match(/<strong>Jawaban:\s*([A-E])<\/strong>/i);
          
          let qType = 'standard';
          let correctAnswer = ansMatch ? ansMatch[1].toUpperCase() : null;
          let hasInteractiveOptions = false;
          
          if (!correctAnswer) {
             const pgkMatches = [...token.matchAll(/Pernyataan \d+:\s*<(?:strong|b|em)>(YA|TIDAK|BENAR|SALAH)<\/(?:strong|b|em)>/ig)];
             if (pgkMatches.length === 0) {
                const pgkMatches2 = [...token.matchAll(/Pernyataan \d+:\s*(YA|TIDAK|BENAR|SALAH)/ig)];
                if (pgkMatches2.length > 0) {
                    qType = 'complex';
                    correctAnswer = pgkMatches2.map(m => m[1].toUpperCase());
                }
             } else {
                 qType = 'complex';
                 correctAnswer = pgkMatches.map(m => m[1].toUpperCase());
             }
          }

          let cleanedHtml = token;
          const detailsEndIndex = token.lastIndexOf('</details>');
          if (detailsEndIndex !== -1) cleanedHtml = token.substring(0, detailsEndIndex + 10);
          
          // --- SULAP OPSI A-E MENJADI KARTU INTERAKTIF ---
          if (correctAnswer && qType === 'standard') {
              const optionsRegex = /<(?:p|div)>[\s\u00A0]*A\.[\s\u00A0]*(.*?)<br\s*\/?>[\s\u00A0]*B\.[\s\u00A0]*(.*?)<br\s*\/?>[\s\u00A0]*C\.[\s\u00A0]*(.*?)<br\s*\/?>[\s\u00A0]*D\.[\s\u00A0]*(.*?)<br\s*\/?>[\s\u00A0]*E\.[\s\u00A0]*(.*?)<\/(?:p|div)>/is;
              
              if (optionsRegex.test(cleanedHtml)) {
                  cleanedHtml = cleanedHtml.replace(optionsRegex, (match, a, b, c, d, e) => {
                      return `<div class="cbt-options-container">
                          <div class="cbt-opt-row" data-opt="A">${a}</div>
                          <div class="cbt-opt-row" data-opt="B">${b}</div>
                          <div class="cbt-opt-row" data-opt="C">${c}</div>
                          <div class="cbt-opt-row" data-opt="D">${d}</div>
                          <div class="cbt-opt-row" data-opt="E">${e}</div>
                      </div>`;
                  });
                  hasInteractiveOptions = true;
              }
          }

          filteredQuestions.push({ 
            htmlContent: validSupportText + cleanedHtml, 
            correctKey: correctAnswer || '',
            qType: qType,
            hasInteractiveOptions: hasInteractiveOptions 
          });
        }
      });
      setCbtQuestions(filteredQuestions);
    }
  }, [packet]);
  
  if (!packet || !topic) return null;

  const wordCount = packet.content ? packet.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 150); 

  const handleComplexAnswer = (statementIndex, value) => {
    if (isCbtSubmitted) return;
    setUserAnswers(prev => {
       const prevQAns = prev[currentCbtIndex] || {};
       return {
          ...prev,
          [currentCbtIndex]: {
             ...prevQAns,
             [statementIndex]: value 
          }
       };
    });
  };

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
      
      if (isCbtMode && !isCbtSubmitted && domNode.name === 'details') return <></>; 
      if (isCbtMode && domNode.name === 'hr') return <></>;

      // --- KARTU OPSI BERBASIS CSS CLASS ---
      if (isCbtMode && domNode.name === 'div' && domNode.attribs?.class === 'cbt-opt-row') {
          const opt = domNode.attribs['data-opt'];
          const currentSelection = userAnswers[currentCbtIndex];
          const isSelected = currentSelection === opt;
          const correctAns = isCbtSubmitted ? cbtQuestions[currentCbtIndex]?.correctKey : null;

          let cardClass = [styles.optCard];
          let iconClass = [styles.optCardIcon, styles.iconDefault];

          if (isCbtSubmitted) {
              cardClass.push(styles.optCardDisabled);
              if (correctAns === opt) {
                  cardClass.push(styles.optCardCorrect);
                  iconClass = [styles.optCardIcon, styles.iconCorrect];
              } else if (isSelected && correctAns !== opt) {
                  cardClass.push(styles.optCardWrong);
                  iconClass = [styles.optCardIcon, styles.iconWrong];
              }
          } else {
              if (isSelected) {
                  cardClass.push(styles.optCardSelected);
                  iconClass = [styles.optCardIcon, styles.iconSelected];
              }
          }

          return (
              <div onClick={() => handleSelectAnswer(opt)} className={cardClass.join(' ')}>
                  <span className={iconClass.join(' ')}>
                      {isSelected ? '■' : '□'}
                  </span>
                  <div style={{ flex: 1, margin: 0, color: 'inherit' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{opt}.</span>
                      {domToReact(domNode.children, options)}
                  </div>
              </div>
          );
      }

      // --- TABEL PGK BERBASIS CSS CLASS ---
      if (isCbtMode && domNode.name === 'tr' && domNode.parent?.name === 'tbody' && cbtQuestions[currentCbtIndex]?.qType === 'complex') {
          const trs = domNode.parent.children.filter(c => c.name === 'tr');
          const rowIndex = trs.indexOf(domNode);

          const currentSelection = userAnswers[currentCbtIndex]?.[rowIndex];
          const correctAns = isCbtSubmitted ? cbtQuestions[currentCbtIndex].correctKey[rowIndex] : null;

          const statementTd = domNode.children.filter(c => c.name === 'td')[0];

          const getPgkClass = (val) => {
               let classes = [styles.pgkCell];
               if (isCbtSubmitted) classes.push(styles.pgkCellDisabled);
               
               if (isCbtSubmitted) {
                   if (correctAns === val) classes.push(styles.pgkCellCorrect);
                   else if (currentSelection === val && correctAns !== val) classes.push(styles.pgkCellWrong);
               } else {
                   if (currentSelection === val) classes.push(styles.pgkCellSelected);
               }
               return classes.join(' ');
          };

          return (
              <tr>
                  {domToReact([statementTd], options)}
                  <td className={getPgkClass('YA')} onClick={() => handleComplexAnswer(rowIndex, 'YA')}>
                      {currentSelection === 'YA' ? '●' : '○'}
                  </td>
                  <td className={getPgkClass('TIDAK')} onClick={() => handleComplexAnswer(rowIndex, 'TIDAK')}>
                      {currentSelection === 'TIDAK' ? '●' : '○'}
                  </td>
              </tr>
          );
      }
    }
  };

  const cleanContent = sanitizeHtml((packet.content || '').replace(/\n/g, ''), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 
      'img', 'div', 'span', 'br', 'hr', 'details', 'summary',
      'table', 'thead', 'tbody', 'tr', 'th', 'td' 
    ]),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'width', 'height', 'title'],
        'div': ['class', 'style', 'id', 'data-ad-slot', 'data-opt'], 
        'span': ['class', 'style', 'id'],
        'ul': ['class', 'style', 'id'], 'ol': ['class', 'style', 'id'], 'li': ['class', 'style', 'id'],
        'h1': ['class', 'style', 'id'], 'h2': ['class', 'style', 'id'], 'h3': ['class', 'style', 'id'],
        'hr': ['class', 'style', 'id'], 'br': ['class', 'style', 'id'], 'p': ['class', 'style', 'id'],
        'a': ['href', 'target', 'id'], 'details': ['style', 'class', 'open'], 'summary': ['style', 'class'],
        'table': ['style', 'class', 'width'],
        'thead': ['style', 'class'], 'tbody': ['style', 'class'], 'tr': ['style', 'class'],
        'th': ['style', 'class'], 'td': ['style', 'class']
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
      cbtQuestions.forEach((q, idx) => { 
        if (q.qType === 'standard') {
            if (userAnswers[idx] === q.correctKey) correctCount++; 
        } else if (q.qType === 'complex' && Array.isArray(q.correctKey)) {
            const userAnsObj = userAnswers[idx] || {};
            const isAllCorrect = q.correctKey.every((key, i) => userAnsObj[i] === key);
            if (isAllCorrect) correctCount++;
        }
      });
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

  const toggleCbtMode = () => {
    if (isCbtMode) {
      if (window.confirm('Apakah Anda yakin ingin membatalkan ujian dan kembali ke Mode Baca?')) {
        handleResetCbt();
        router.push(pathname.replace(/^\/cbt/, '')); 
      }
    } else {
      window.location.href = `/cbt${pathname}`;
    }
  };

  const activeQuestion = cbtQuestions[currentCbtIndex];

  const safeUserAnswersForSidebar = {};
  Object.keys(userAnswers).forEach(key => {
    if (typeof userAnswers[key] === 'object') {
      safeUserAnswersForSidebar[key] = '✓'; 
    } else {
      safeUserAnswersForSidebar[key] = userAnswers[key];
    }
  });

  return (
    <div className={styles.holyGrailLayout}>

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

      <main className={styles.mainContent}>
            <Breadcrumbs items={[{ label: topic.title, link: `/${topicSlug}` }, { label: packet.title, link: null }]} />
            <div className={styles.chapterHeader}>
              <div>
                <h1>{topic.title}</h1>
                <h2>{packet.title}</h2>
              </div>

              <div className={styles.singleToggleContainer}>
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
                  <div className={styles.cbtQuestionBox}>
                    <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>
                      {activeQuestion ? parse(renderLaTeX(activeQuestion.htmlContent), options) : <p>Memuat soal...</p>}
                    </div>

                    {/* HANYA TAMPIL JIKA GAGAL MENYULAP OPSI (FALLBACK) */}
                    {activeQuestion?.qType === 'standard' && !activeQuestion?.hasInteractiveOptions && (
                      <div className={styles.cbtAnswerSelector}>
                        <p className={styles.selectorLabel}>Pilih Lembar Jawaban Anda:</p>
                        <div className={styles.optionButtonGroup}>
                          {['A', 'B', 'C', 'D', 'E'].map((opt) => {
                            const isSelected = userAnswers[currentCbtIndex] === opt;
                            const isCorrectKey = activeQuestion?.correctKey === opt;
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
                    )}
                    
                    {/* INSTRUKSI ELEGAN JIKA OPSI BERHASIL DISULAP */}
                    {activeQuestion?.qType === 'standard' && activeQuestion?.hasInteractiveOptions && (
                      <div className={styles.cbtAnswerSelector} style={{ borderTop: 'none', paddingTop: 0 }}>
                         <p className={styles.selectorLabel} style={{ color: '#0ea5e9' }}>
                           <em>Silakan klik langsung pada pilihan kotak di atas untuk menjawab.</em>
                         </p>
                      </div>
                    )}

                    {activeQuestion?.qType === 'complex' && (
                      <div className={styles.cbtAnswerSelector} style={{ borderTop: 'none', paddingTop: 0 }}>
                         <p className={styles.selectorLabel} style={{ color: '#0ea5e9' }}>
                           <em>Silakan klik langsung pada tabel di atas untuk menjawab Pernyataan (Ya/Tidak)</em>
                         </p>
                      </div>
                    )}

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
                          <button onClick={handleResetCbt} className={styles.submitCbtBtn} style={{ background: '#374151' }}>Ulangi Ujian</button>
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
                  {cbtQuestions.map((q, idx) => {
                    let hasAnswered = false;
                    if (q.qType === 'standard') {
                       hasAnswered = userAnswers[idx] !== undefined;
                    } else if (q.qType === 'complex' && Array.isArray(q.correctKey)) {
                       hasAnswered = userAnswers[idx] && Object.keys(userAnswers[idx]).length === q.correctKey.length;
                    }

                    const isCurrent = currentCbtIndex === idx;

                    let tileStyle = styles.mobileGridTile;
                    if (hasAnswered) tileStyle += ` ${styles.mobileGridTileAnswered}`;
                    if (isCurrent) tileStyle += ` ${styles.mobileGridTileCurrent}`;
                    
                    if (isCbtSubmitted) {
                      let isTileCorrect = false;
                      if (q.qType === 'standard') {
                         isTileCorrect = userAnswers[idx] === q.correctKey;
                      } else if (q.qType === 'complex') {
                         const userAnsObj = userAnswers[idx] || {};
                         isTileCorrect = q.correctKey.every((key, i) => userAnsObj[i] === key);
                      }
                      
                      tileStyle += isTileCorrect ? ` ${styles.mobileGridTileCorrect}` : ` ${styles.mobileGridTileWrong}`;
                      if (isCurrent) tileStyle += ` ${styles.mobileGridTileCurrentReview}`;
                    }
                    
                    const miniLabel = q.qType === 'standard' ? (userAnswers[idx] || '-') : (hasAnswered ? '✓' : 'PGK');

                    return (
                      <button key={`mob-grid-${idx}`} onClick={() => setCurrentCbtIndex(idx)} className={tileStyle}>
                        {idx + 1}
                        <span className={styles.miniLabel}>{miniLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginBottom: '10px', marginTop: '-15px' }}>
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
          userAnswers: safeUserAnswersForSidebar,
          isCbtSubmitted,
          setCurrentCbtIndex
        }}
      />
    </div>
  );
}