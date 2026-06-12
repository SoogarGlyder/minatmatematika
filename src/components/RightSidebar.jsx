// File: src/components/RightSidebar.jsx
'use client';

import React from 'react';
import { FaMinus, FaPlus, FaRedoAlt, FaShoppingBag } from 'react-icons/fa';

import { useFontSize } from '@/contexts/FontSizeContext';
import styles from './RightSidebar.module.css'; 

// 1. IMPORT KOMPONEN IKLAN
import AdBanner from '@/components/AdBanner';

export default function RightSidebar({ affiliateData }) {
  const { changeFontSize, resetFontSize } = useFontSize();
  const hasAffiliate = affiliateData && affiliateData.link && affiliateData.image && affiliateData.title;

  return (
    <aside className={styles.rightSidebar}>
      
      {/* KOTAK UKURAN FONT */}
      <div className={styles.rightContainer}>
        <h3 className={styles.sidebarTitle}>Ukuran Font</h3>
        <div className={styles.fontControlButtons}>
          <button 
            onClick={() => changeFontSize(-1)} 
            className={styles.fontBtn} 
            title="Kecilkan Huruf"
          >
            <FaMinus />
          </button>
          <button 
            onClick={resetFontSize} 
            className={styles.fontBtn} 
            title="Reset Ukuran Huruf"
          >
            <FaRedoAlt />
          </button>
          <button 
            onClick={() => changeFontSize(1)} 
            className={styles.fontBtn} 
            title="Besarkan Huruf"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* KOTAK AFILIASI DAN DONASI (STICKY) */}
      <div className={styles.stickyWrapper}>
        <div className={styles.rightContainer}>
          <h3 className={styles.sidebarTitle} style={{ fontSize: '0.8rem', color: '#888', margin: '0' }}>
            Sponsor
          </h3>
          <AdBanner
            dataAdSlot="4896743654"
            style={{ width: '160px', height: '300px', alignSelf: 'center', margin: '12px 0 0 0 !important' }} 
            dataAdFormat=""
            dataFullWidthResponsive={false}
          />
        </div>

        {hasAffiliate && (
          <div className={styles.rightContainer}>
            <h3 className={styles.sidebarTitle}>Koleksi Merch</h3>
            <div className={styles.affiliateImageWrapper}>
              <img 
                src={affiliateData.image} 
                alt={affiliateData.title} 
                className={styles.affiliateImage} 
              />
            </div>
            <p className={styles.affiliateTitle}>
              {affiliateData.title}
            </p>
            <a 
              href={affiliateData.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.affiliateLink}
            >
              <div className={styles.affiliateBtn}>
                 Cek di Shopee <FaShoppingBag />
              </div>
            </a>
          </div>
        )}

        <div className={styles.rightContainer}>
          <h3 className={styles.sidebarTitle}>Dukung Kami Yuk!</h3>
          <a href="https://saweria.co/SoogarGlyder" target="_blank" rel="noreferrer">
            <img className={styles.saweria} src="/saweria.png" alt="QR Code Saweria"/>
          </a>
        </div>

      </div>
    </aside>
  );
}