<<<<<<< HEAD
// File: src/components/Header.jsx
=======
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link'; 
import { usePathname, useRouter } from 'next/navigation'; 
import { useTheme } from 'next-themes'; 
import { FaSun, FaMoon } from 'react-icons/fa'; 
import styles from './Header.module.css';
import { useGlobalContext } from '../app/providers'; 
<<<<<<< HEAD
import TopicList from './TopicList'; 
import ReadingProgressBar from '@/components/ReadingProgressBar';

// Kategori Matematika
const seriesTabs = [
  { id: 'Penalaran Umum', name: 'Penalaran Umum' },
  { id: 'Penalaran Matematika', name: 'Penalaran Matematika' },
  { id: 'Pengetahuan Kuantitatif', name: 'Pengetahuan Kuantitatif' },
  { id: 'PKS Kelas 10', name: 'PKS Kelas 10' },
  { id: 'PKS Kelas 11', name: 'PKS Kelas 11' },
  { id: 'PKS Kelas 12', name: 'PKS Kelas 12' },
=======
import HomeGrid from './Home/HomeGrid'; // <-- Import HomeGrid yang berdesain Magazine
import ReadingProgressBar from './ReadingProgressBar'; 

// Tab Kategori Matematika disamakan dengan Home
const categoryTabs = [
  { id: 'terbaru', name: 'Terbaru' },
  { id: 'PU', name: 'Penalaran Umum (PU)' },
  { id: 'PK', name: 'Pengetahuan Kuantitatif (PK)' },
  { id: 'PM', name: 'Penalaran Matematika (PM)' },
  { id: 'PKS 10', name: 'PKS 10' },
  { id: 'PKS 11', name: 'PKS 11' },
  { id: 'PKS 12', name: 'PKS 12' },
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
];

function Header() {
  const { 
<<<<<<< HEAD
    activeSerie, 
    isListOpen, 
    setIsListOpen, 
    dropdownSerie, 
    setDropdownSerie 
=======
    activeCategory, 
    isListOpen, 
    setIsListOpen, 
    dropdownCategory, 
    setDropdownCategory 
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  } = useGlobalContext();

  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname(); 
  const router = useRouter();     
  const navRef = useRef(null);
  const [maskStyle, setMaskStyle] = useState({});
  
  const isActive = (path) => pathname ? pathname.startsWith(path) : false;
  const isHomePage = pathname === '/';
  const isAdminPage = pathname?.startsWith('/admin');
<<<<<<< HEAD
  
  const isBlogPage = pathname?.startsWith('/materi') || pathname?.startsWith('/articles');
  const isOtherPage = isBlogPage; 

  const isChapterPage = pathname && !isOtherPage && !isHomePage && !isAdminPage
    ? pathname.split('/').filter(Boolean).length === 2 
    : false;

=======

  const isPaketSoalPage = pathname && !isHomePage && !isAdminPage
    ? pathname.split('/').filter(Boolean).length === 2 
    : false;

  // Otomatis menutup dropdown saat pindah halaman
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  useEffect(() => {
    setIsListOpen(false);
  }, [pathname, setIsListOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMask = () => {
    const el = navRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const isAtStart = scrollLeft <= 0;
    const isAtEnd = scrollWidth - scrollLeft - clientWidth <= 1;
    let maskImage = '';

    if (window.innerWidth > 1023) {
      maskImage = '';
    } else if (isAtStart) {
      maskImage = 'linear-gradient(to right, black 85%, transparent 100%)';
    } else if (isAtEnd) {
      maskImage = 'linear-gradient(to right, transparent 0%, black 15%)'; 
    } else {
      maskImage = 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)';
    }

    setMaskStyle({
      maskImage: maskImage,
      WebkitMaskImage: maskImage
    });
  };

  useEffect(() => {
    if (!isHomePage) {
      updateMask();
      window.addEventListener('resize', updateMask);
      return () => window.removeEventListener('resize', updateMask);
    }
  }, [isHomePage]);

<<<<<<< HEAD
  const handleTabClick = (serieId) => {
    if (serieId === dropdownSerie && isListOpen) {
      setIsListOpen(false);
    } else {
      setDropdownSerie(serieId);
=======
  const handleTabClick = (catId) => {
    if (catId === dropdownCategory && isListOpen) {
      setIsListOpen(false);
    } else {
      // Langsung simpan ID-nya (contoh: 'PU', 'PKS 10') agar bisa dibaca API
      setDropdownCategory(catId); 
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
      setIsListOpen(true);
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  if (isAdminPage) {
      return null;
  }

  return (
    <>
      <div className={styles.headerBar}>
        <div className={styles.topBar}>
          <div className={styles.leftSection}>
<<<<<<< HEAD
            <Link href="/" className={styles.logoLink} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              {mounted && (
                <img 
                  src={resolvedTheme === 'dark' ? '/minat-matematika-logo-saja-transparent.png' : '/minat-matematika-logo-saja-transparent-black.png'} 
                  alt="Logo" 
                  style={{ height: '110px', width: 'auto', objectFit: 'contain' }} 
                />
              )}

              <div className={styles.logoTextWrapper}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.1', marginBottom: '-4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '300', letterSpacing: '2px', color: 'var(--foreground)', textTransform: 'uppercase' }}>
                    Minat
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--foreground)', textTransform: 'uppercase' }}>
                    Matematika
                  </span>
                </div>
              </div>
            </Link>
            
            <nav className={styles.topNav}>
              {/* Teks diubah menjadi Materi */}
              <Link 
                href="/materi" 
                className={`${styles.navItem} ${isActive('/materi') || isActive('/articles') ? styles.navActive : ''}`}
              >
                Materi
=======
            <Link href="/" className={styles.logoLink} style={{textDecoration: 'none'}}>
              <h2 style={{color: 'var(--primary)', fontWeight: '900', margin: 0, fontSize: '1.2rem'}}>
                MINAT MATEMATIKA
              </h2>
            </Link>
            
            <nav className={styles.topNav}>
              <Link href="/" className={`${styles.navItem} ${isHomePage ? styles.navActive : ''}`}>
                Beranda
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
              </Link>

              <button 
                className={styles.themeToggleBtn}
                onClick={toggleTheme}
                aria-label="Ganti Tema"
              >
                {mounted && (resolvedTheme === 'dark' ? <FaSun /> : <FaMoon />)}
              </button>
<<<<<<< HEAD

=======
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
            </nav>
          </div>
        </div>

        {!isHomePage && (
          <nav
            className={styles.navContainer}
            ref={navRef}
            onScroll={updateMask}
            style={maskStyle}
            >
<<<<<<< HEAD
            {seriesTabs.map((tab) => {
              const isActiveByReading = !isOtherPage && activeSerie === tab.id;
              const isActiveByDropdown = isListOpen && dropdownSerie === tab.id;
=======
            {categoryTabs.map((tab) => {
              const isActiveByReading = activeCategory === tab.name; // Mencocokkan nama kategori penuh
              const isActiveByDropdown = isListOpen && dropdownCategory === tab.id;
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
              const showAsActive = isActiveByReading || isActiveByDropdown;

              return (
                <div
                  key={tab.id}
<<<<<<< HEAD
                  className={`${styles.navContent} ${
                    showAsActive ? styles.active : ''
                  }`}
=======
                  className={`${styles.navContent} ${showAsActive ? styles.active : ''}`}
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.name}
                </div>
              );
            })}
          </nav>
        )}
<<<<<<< HEAD
        {isChapterPage && <ReadingProgressBar />}
      </div>

      {!isHomePage && isListOpen && (
        <TopicList 
          activeSerie={dropdownSerie}
          onNovelClick={() => setIsListOpen(false)}
          navigate={router.push} 
          isOverlay={true}
       />
=======
        
        {isPaketSoalPage && <ReadingProgressBar />}
      </div>

      {/* Menampilkan Grid Magazine saat Tab di Header diklik */}
      {!isHomePage && isListOpen && (
        <div className={styles.dropdownOverlay}>
          <div className={styles.dropdownGridContainer}>
            <HomeGrid activeTab={dropdownCategory} />
          </div>
        </div>
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
      )}
    </>
  );
}

export default Header;