'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link'; 
import { usePathname, useRouter } from 'next/navigation'; 
import { useTheme } from 'next-themes'; 
import { FaSun, FaMoon } from 'react-icons/fa'; 
import styles from './Header.module.css';
import { useGlobalContext } from '../app/providers'; 

// Mengganti tab SAO menjadi tab Kategori Matematika
const categoryTabs = [
  { id: 'penalaran-umum', name: 'Penalaran Umum' },
  { id: 'pengetahuan-kuantitatif', name: 'Pengetahuan Kuantitatif' },
  { id: 'penalaran-matematika', name: 'Penalaran Matematika' },
  { id: 'aljabar', name: 'Aljabar' },
  { id: 'geometri', name: 'Geometri' },
];

function Header() {
  const { 
    activeCategory, 
    isListOpen, 
    setIsListOpen, 
    dropdownCategory, 
    setDropdownCategory 
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

  // Asumsi format URL baru: /[kategoriSlug]/[paketSlug]
  const isKategoriPage = pathname && !isHomePage && !isAdminPage
    ? pathname.split('/').filter(Boolean).length === 1 
    : false;

  const isPaketSoalPage = pathname && !isHomePage && !isAdminPage
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

  const handleTabClick = (catId) => {
    if (catId === dropdownCategory && isListOpen) {
      setIsListOpen(false);
    } else {
      setDropdownCategory(catId);
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
            <Link href="/" className={styles.logoLink} style={{textDecoration: 'none'}}>
              <h2 style={{color: 'var(--primary)', fontWeight: '900', margin: 0, fontSize: '1.2rem'}}>
                MINAT MATEMATIKA
              </h2>
            </Link>
            
            <nav className={styles.topNav}>
              <Link href="/" className={`${styles.navItem} ${isHomePage ? styles.navActive : ''}`}>
                Beranda
              </Link>
              <Link href="/materi" className={`${styles.navItem} ${isActive('/materi') ? styles.navActive : ''}`}>
                Daftar Materi
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
            {categoryTabs.map((tab) => {
              const isActiveByReading = activeCategory === tab.id;
              const isActiveByDropdown = isListOpen && dropdownCategory === tab.id;
              const showAsActive = isActiveByReading || isActiveByDropdown;

              return (
                <div
                  key={tab.id}
                  className={`${styles.navContent} ${showAsActive ? styles.active : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.name}
                </div>
              );
            })}
          </nav>
        )}
        
        {/* {isPaketSoalPage && <ReadingProgressBar />} */}
      </div>

      {/* TODO: Nanti kita buat komponen CategoryList pengganti NovelList */}
      {/* {!isHomePage && isListOpen && (
        <CategoryList 
          activeCategory={dropdownCategory}
          onCategoryClick={() => setIsListOpen(false)}
          navigate={router.push} 
          isOverlay={true}
       />
      )} */}
    </>
  );
}

export default Header;