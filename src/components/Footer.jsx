'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Sembunyikan footer di halaman admin jika nanti kamu membuat halaman admin
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.brandColumn}>
          <h3 className={styles.brandName}>Minat Matematika</h3>
          <p className={styles.brandDesc}>
            Platform belajar matematika interaktif dan persiapan UTBK SNBT terlengkap. 
            Menyediakan pembahasan soal Penalaran Umum, Pengetahuan Kuantitatif, dan Matematika Dasar.
          </p>
        </div>

        <div className={styles.linkColumn}>
          <h4 className={styles.columnTitle}>Menu Utama</h4>
          <ul className={styles.linkList}>
            <li><Link href="/">Beranda</Link></li>
            <li><Link href="/?cat=Penalaran+Umum">Penalaran Umum</Link></li>
            <li><Link href="/?cat=Pengetahuan+Kuantitatif">Pengetahuan Kuantitatif</Link></li>
            <li><Link href="/?cat=Penalaran+Matematika">Penalaran Matematika</Link></li>
          </ul>
        </div>

        <div className={styles.linkColumn}>
          <h4 className={styles.columnTitle}>Informasi</h4>
          <ul className={styles.linkList}>
            <li><Link href="/about">Tentang Kami</Link></li>
            <li><Link href="/contact">Hubungi Kami</Link></li>
            <li><Link href="/privacy">Kebijakan Privasi</Link></li>
            <li><Link href="/disclaimer">Disclaimer</Link></li>
          </ul>
        </div>

      </div>

      <div className={styles.bottomBar}>
        <p>
          &copy; {currentYear} Minat Matematika. <span className={styles.hiddenMobile}>Hak Cipta Dilindungi.</span>
        </p>
        <p className={styles.maker}>
          Made with <span style={{color: '#e25555'}}>❤</span> for Education
        </p>
      </div>
    </footer>
  );
}

export default Footer;