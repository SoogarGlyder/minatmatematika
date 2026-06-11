<<<<<<< HEAD
// File: src/components/Footer.jsx
=======
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

<<<<<<< HEAD
=======
  // Sembunyikan footer di halaman admin jika nanti kamu membuat halaman admin
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.brandColumn}>
          <h3 className={styles.brandName}>Minat Matematika</h3>
          <p className={styles.brandDesc}>
<<<<<<< HEAD
            Platform belajar dan simulasi tryout matematika mandiri. 
            Membantu persiapan SNBT/UTBK dengan latihan soal terstruktur 
            dan pembahasan yang komprehensif.
=======
            Platform belajar matematika interaktif dan persiapan UTBK SNBT terlengkap. 
            Menyediakan pembahasan soal Penalaran Umum, Pengetahuan Kuantitatif, dan Matematika Dasar.
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
          </p>
        </div>

        <div className={styles.linkColumn}>
<<<<<<< HEAD
          <h4 className={styles.columnTitle}>Menu</h4>
          <ul className={styles.linkList}>
            <li><Link href="/">Beranda</Link></li>
            {/* Teks diubah menjadi Materi */}
            <li><Link href="/materi">Materi</Link></li>
=======
          <h4 className={styles.columnTitle}>Menu Utama</h4>
          <ul className={styles.linkList}>
            <li><Link href="/">Beranda</Link></li>
            <li><Link href="/?cat=Penalaran+Umum">Penalaran Umum</Link></li>
            <li><Link href="/?cat=Pengetahuan+Kuantitatif">Pengetahuan Kuantitatif</Link></li>
            <li><Link href="/?cat=Penalaran+Matematika">Penalaran Matematika</Link></li>
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
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
<<<<<<< HEAD
          &copy; {currentYear} Minat Matematika. <span className={styles.hiddenMobile}>All rights reserved.</span>
        </p>
        <p className={styles.maker}>
          Made with <span style={{color: '#e25555'}}>❤</span> by SoogarGlyder
=======
          &copy; {currentYear} Minat Matematika. <span className={styles.hiddenMobile}>Hak Cipta Dilindungi.</span>
        </p>
        <p className={styles.maker}>
          Made with <span style={{color: '#e25555'}}>❤</span> for Education
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
        </p>
      </div>
    </footer>
  );
}

export default Footer;