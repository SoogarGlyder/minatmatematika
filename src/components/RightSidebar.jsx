// File: src/components/RightSidebar.jsx
'use client';

import React from 'react';
import { FaMinus, FaPlus, FaRedoAlt, FaShoppingBag } from 'react-icons/fa';
import { useFontSize } from '@/contexts/FontSizeContext';
import styles from './RightSidebar.module.css'; 

// IMPORT KOMPONEN IKLAN
import AdBanner from '@/components/AdBanner';
import { AD_SLOTS, SHOW_CBT_SIDEBAR_BAWAH } from '@/lib/adSlots';

export default function RightSidebar({ affiliateData, isCbtMode, cbtProps }) {
  const { changeFontSize, resetFontSize } = useFontSize();
  const hasAffiliate = affiliateData && affiliateData.link && affiliateData.image && affiliateData.title;

  // Mengekstrak properti CBT dengan aman (fallback nilai kosong jika sedang mode baca)
  const { 
    cbtQuestions = [], 
    currentCbtIndex = 0, 
    userAnswers = {}, 
    isCbtSubmitted = false, 
    setCurrentCbtIndex = () => {},
    tiles = null // opsional: data tile siap pakai dari tryout terstruktur
  } = cbtProps || {};

  return (
    <aside className={`${styles.rightSidebar} ${isCbtMode ? styles.cbtSidebar : ''}`}>
      
      {/* --- AREA ATAS (NON-STICKY) --- */}
      <div className={styles.topSection}>
        {/* 1. KOTAK UKURAN FONT */}
        <div className={styles.rightContainer}>
          <h3 className={styles.sidebarTitle}>Ukuran Font</h3>
          <div className={styles.fontControlButtons}>
            <div className={styles.fontRow}>
              <button onClick={() => changeFontSize(-1)} className={styles.fontBtn} title="Kecilkan Huruf">
                <FaMinus />
              </button>
              <button onClick={() => changeFontSize(1)} className={styles.fontBtn} title="Besarkan Huruf">
                <FaPlus />
              </button>
            </div>
            <div className={styles.fontRow}>
              <button onClick={resetFontSize} className={styles.fontBtn} title="Reset Ukuran Huruf">
                <FaRedoAlt />
              </button>
            </div>
          </div>
        </div>

        {/* 2. KOTAK SAWERIA */}
        <div className={styles.rightContainer}>
          <h3 className={styles.sidebarTitle}>Dukung Kami!</h3>
          <a href="https://saweria.co/SoogarGlyder" target="_blank" rel="noreferrer" className={styles.saweriaLink}>
            <img className={styles.saweria} src="/saweria.png" alt="QR Code Saweria"/>
          </a>
        </div>
      </div>

      {/* --- AREA BAWAH (STICKY MELAYANG) --- */}
      <div className={styles.stickyWrapper}>        
        
        {/* ========================================================= */}
        {/* PETA NOMOR SOAL (HANYA MUNCUL JIKA MODE CBT AKTIF)        */}
        {/* ========================================================= */}
        {isCbtMode && cbtProps && (
          <div className={styles.cbtAnswerGridMap}>
            <h4>Peta Nomor Soal</h4>
            <div className={styles.gridContainer}>
              {tiles ? tiles.map((t, idx) => {
                const isCurrent = currentCbtIndex === idx;
                let tileStyle = styles.gridTile;
                if (t.answered) tileStyle += ` ${styles.gridTileAnswered}`;
                if (t.flagged) tileStyle += ` ${styles.gridTileFlagged}`;
                if (isCurrent) tileStyle += ` ${styles.gridTileCurrent}`;
                if (t.status === 'correct') tileStyle += ` ${styles.gridTileCorrect}`;
                else if (t.status === 'wrong') tileStyle += ` ${styles.gridTileWrong}`;
                else if (t.status === 'skipped') tileStyle += ` ${styles.gridTileSkipped}`;
                if (t.status && isCurrent) tileStyle += ` ${styles.gridTileCurrentReview}`;

                return (
                  <button key={idx} onClick={() => setCurrentCbtIndex(idx)} className={tileStyle}>
                    {t.number}
                    <span className={styles.miniLabel}>{t.label}</span>
                  </button>
                );
              }) : cbtQuestions.map((_, idx) => {
                const hasAnswered = userAnswers[idx] !== undefined;
                const isCurrent = currentCbtIndex === idx;

                let tileStyle = styles.gridTile;
                if (hasAnswered) tileStyle += ` ${styles.gridTileAnswered}`;
                if (isCurrent) tileStyle += ` ${styles.gridTileCurrent}`;
                
                if (isCbtSubmitted) {
                  const isTileCorrect = userAnswers[idx] === cbtQuestions[idx].correctKey;
                  tileStyle += isTileCorrect ? ` ${styles.gridTileCorrect}` : ` ${styles.gridTileWrong}`;
                  if (isCurrent) tileStyle += ` ${styles.gridTileCurrentReview}`;
                }

                return (
                  <button key={idx} onClick={() => setCurrentCbtIndex(idx)} className={tileStyle}>
                    {idx + 1}
                    <span className={styles.miniLabel}>{userAnswers[idx] || '-'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* IKLAN ATAS (FIXED 300x250) */}
        <div className={styles.adWrapper}>
          <AdBanner
            dataAdSlot={isCbtMode ? AD_SLOTS.CBT_SIDEBAR_ATAS : AD_SLOTS.BACA_SIDEBAR_ATAS}
            dataAdFormat=""
            dataFullWidthResponsive={false}
            style={{ display: 'inline-block', width: '300px', height: '250px' }}
          />
        </div>

        {/* KOTAK AFFILIATE */}
        {hasAffiliate && (
          <div className={styles.rightContainer}>
            <h3 className={styles.sidebarTitle}>Koleksi Merch</h3>
            <div className={styles.affiliateImageWrapper}>
              <img src={affiliateData.image} alt={affiliateData.title} className={styles.affiliateImage} />
            </div>
            <p className={styles.affiliateTitle}>{affiliateData.title}</p>
            <a href={affiliateData.link} target="_blank" rel="noopener noreferrer" className={styles.affiliateLink}>
              <button className={styles.affiliateBtn}>
                 Cek di Shopee <FaShoppingBag />
              </button>
            </a>
          </div>
        )}

        {/* IKLAN BAWAH (FIXED 300x250). Di mode CBT disembunyikan agar tidak berlebihan bersama Offerwall;
            untuk menampilkannya lagi ubah SHOW_CBT_SIDEBAR_BAWAH di src/lib/adSlots.js */}
        {(!isCbtMode || SHOW_CBT_SIDEBAR_BAWAH) && (
          <div className={styles.adWrapper}>
            <AdBanner
              dataAdSlot={isCbtMode ? AD_SLOTS.CBT_SIDEBAR_BAWAH : AD_SLOTS.BACA_SIDEBAR_BAWAH}
              dataAdFormat=""
              dataFullWidthResponsive={false}
              style={{ display: 'inline-block', width: '300px', height: '250px' }}
            />
          </div>
        )}

      </div>
    </aside>
  );
}