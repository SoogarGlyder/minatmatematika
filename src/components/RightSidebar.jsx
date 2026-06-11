<<<<<<< HEAD
// File: src/components/RightSidebar.jsx
'use client';

import React from 'react';
import { FaMinus, FaPlus, FaRedoAlt, FaShoppingBag } from 'react-icons/fa';

import { useFontSize } from '@/contexts/FontSizeContext';
import styles from './RightSidebar.module.css'; 

// 1. IMPORT KOMPONEN IKLAN
import AdBanner from '@/components/AdBanner';

=======
'use client';

import React, { useEffect } from 'react';
import Image from 'next/image'; // <-- IMPORT JURUS NEXT/IMAGE
import { FaMinus, FaPlus, FaRedoAlt, FaShoppingBag } from 'react-icons/fa';
import { useFontSize } from '@/contexts/FontSizeContext';
import styles from './RightSidebar.module.css'; 

>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
export default function RightSidebar({ affiliateData }) {
  const { changeFontSize, resetFontSize } = useFontSize();
  const hasAffiliate = affiliateData && affiliateData.link && affiliateData.image && affiliateData.title;

<<<<<<< HEAD
  return (
    <aside className={styles.rightSidebar}>
      
      {/* KOTAK UKURAN FONT */}
      <div className={styles.rightContainer}>
        <h3 className={styles.sidebarTitle}>Ukuran Font</h3>
=======
  // Trik wajib di React/Next.js untuk memicu iklan AdSense
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense Error:', err);
    }
  }, []);

  return (
    <aside className={styles.rightSidebar}>
      
      {/* Pengatur Font & Kotak Iklan */}
      <div className={styles.rightContainer}>
        <h3 className={styles.sidebarTitle}>Ukuran Teks</h3>
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
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
<<<<<<< HEAD
            title="Reset Ukuran Huruf"
=======
            title="Reset Ukuran"
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
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

<<<<<<< HEAD
      {/* KOTAK AFILIASI DAN DONASI (STICKY) */}
      <div className={styles.stickyWrapper}>
        <div className={styles.rightContainer}>
          <h3 className={styles.sidebarTitle} style={{ fontSize: '0.8rem', color: '#888' }}>
            Sponsor
          </h3>
          {/* Pastikan kamu mengganti tulisan di bawah ini dengan Angka Slot Iklanmu nanti */}
          <AdBanner dataAdSlot="MASUKKAN_ANGKA_SLOT_DARI_ADSENSE_DI_SINI" />
        </div>

        {hasAffiliate && (
          <div className={styles.rightContainer}>
            <h3 className={styles.sidebarTitle}>Koleksi Merch</h3>
            <div className={styles.affiliateImageWrapper}>
              <img 
                src={affiliateData.image} 
                alt={affiliateData.title} 
                className={styles.affiliateImage} 
=======
      <div className={styles.stickyWrapper}>

        {/* ========================================== */}
        {/* IKLAN ADSENSE RESPONSIVE                   */}
        {/* ========================================== */}
        <div style={{ marginTop: '20px', width: '100%', overflow: 'hidden', minHeight: '250px' }}>
          <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-4365395677457990"
                data-ad-slot="4896743654"
                data-ad-format="auto"
                data-full-width-responsive="true">
          </ins>
        </div>
        {/* ========================================== */}


        {/* Banner Buku/Alat Tulis Afiliasi */}
        {hasAffiliate && (
          <div className={styles.rightContainer}>
            <h3 className={styles.sidebarTitle}>Rekomendasi Belajar</h3>
            <div className={styles.affiliateImageWrapper}>
              {/* MENGGUNAKAN NEXT/IMAGE */}
              <Image 
                src={affiliateData.image} 
                alt={affiliateData.title} 
                width={250}
                height={250}
                className={styles.affiliateImage}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
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
<<<<<<< HEAD
                 Cek di Shopee <FaShoppingBag />
=======
                 Cek di Shopee <FaShoppingBag style={{marginLeft: '5px'}}/>
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
              </div>
            </a>
          </div>
        )}

<<<<<<< HEAD
        <div className={styles.rightContainer}>
          <h3 className={styles.sidebarTitle}>Dukung Kami Yuk!</h3>
          <a href="https://saweria.co/SoogarGlyder" target="_blank" rel="noreferrer">
            <img className={styles.saweria} src="/saweria.png" alt="QR Code Saweria"/>
=======
        {/* Banner Donasi */}
        <div className={styles.rightContainer}>
          <h3 className={styles.sidebarTitle}>Dukung Kami Yuk!</h3>
          <a href="https://saweria.co/MinatMatematika" target="_blank" rel="noreferrer">
            {/* MENGGUNAKAN NEXT/IMAGE UNTUK LOGO SAWERIA */}
            <Image 
              src="https://saweria.co/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhomepage_characters.a1cf6cc4.svg&w=3840&q=75" 
              alt="Dukung via Saweria"
              width={300}
              height={100}
              className={styles.saweria}
              style={{ width: '100%', height: 'auto' }}
            />
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
          </a>
        </div>

      </div>
<<<<<<< HEAD

=======
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
    </aside>
  );
}