'use client';

import React from 'react';
import { FaMinus, FaPlus, FaRedoAlt, FaShoppingBag } from 'react-icons/fa';
import { useFontSize } from '@/contexts/FontSizeContext';
import styles from './RightSidebar.module.css'; 

export default function RightSidebar({ affiliateData }) {
  const { changeFontSize, resetFontSize } = useFontSize();
  const hasAffiliate = affiliateData && affiliateData.link && affiliateData.image && affiliateData.title;

  return (
    <aside className={styles.rightSidebar}>
      
      {/* Pengatur Font */}
      <div className={styles.rightContainer}>
        <h3 className={styles.sidebarTitle}>Ukuran Teks</h3>
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
            title="Reset Ukuran"
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

      <div className={styles.stickyWrapper}>
        
        {/* Banner Buku/Alat Tulis Afiliasi */}
        {hasAffiliate && (
          <div className={styles.rightContainer}>
            <h3 className={styles.sidebarTitle}>Rekomendasi Belajar</h3>
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
                 Cek di Shopee <FaShoppingBag style={{marginLeft: '5px'}}/>
              </div>
            </a>
          </div>
        )}

        {/* Banner Donasi */}
        <div className={styles.rightContainer}>
          <h3 className={styles.sidebarTitle}>Dukung Kami Yuk!</h3>
          <a href="https://saweria.co/MinatMatematika" target="_blank" rel="noreferrer">
            <img className={styles.saweria} src="https://saweria.co/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhomepage_characters.a1cf6cc4.svg&w=3840&q=75" alt="Dukung via Saweria"/>
          </a>
        </div>

      </div>
    </aside>
  );
}