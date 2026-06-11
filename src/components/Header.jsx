// File: src/components/Header.jsx
'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link'; 
import { usePathname, useRouter } from 'next/navigation'; 
import { useTheme } from 'next-themes'; 
import { FaSun, FaMoon } from 'react-icons/fa'; 
import styles from './Header.module.css';
import { useGlobalContext } from '../app/providers'; 
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
];

function Header() {
  const { 
    activeSerie, 
    isListOpen, 
    setIsListOpen, 
    dropdownSerie, 
    setDropdownSerie 
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
  
  const isBlogPage = pathname?.startsWith('/materi') || pathname?.startsWith('/articles');
  const isOtherPage = isBlogPage; 

  const isChapterPage = pathname && !isOtherPage && !isHomePage && !isAdminPage
    ? pathname.split('/').filter(Boolean).length === 2 
    : false;

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

  const handleTabClick = (serieId) => {
    if (serieId === dropdownSerie && isListOpen) {
      setIsListOpen(false);
    } else {
      setDropdownSerie(serieId);
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
              </Link>

              <button 
                className={styles.themeToggleBtn}
                onClick={toggleTheme}
                aria-label="Ganti Tema"
              >
                {mounted && (resolvedTheme === 'dark' ? <FaSun /> : <FaMoon />)}
              </button>
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
            {seriesTabs.map((tab) => {
              const isActiveByReading = !isOtherPage && activeSerie === tab.id;
              const isActiveByDropdown = isListOpen && dropdownSerie === tab.id;
              const showAsActive = isActiveByReading || isActiveByDropdown;

              return (
                <div
                  key={tab.id}
                  className={`${styles.navContent} ${
                    showAsActive ? styles.active : ''
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.name}
                </div>
              );
            })}
          </nav>
        )}
        {isChapterPage && <ReadingProgressBar />}
      </div>

      {!isHomePage && isListOpen && (
        <TopicList 
          activeSerie={dropdownSerie}
          onNovelClick={() => setIsListOpen(false)}
          navigate={router.push} 
          isOverlay={true}
       />
      )}
    </>
  );
}

export default Header;