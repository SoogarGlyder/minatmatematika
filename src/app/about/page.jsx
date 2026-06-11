// File: src/app/about/page.jsx
import React from 'react';
import Link from 'next/link';
import styles from '../styles/LandPages.module.css';

export const metadata = {
  title: 'Tentang Kami | Minat Matematika',
  description: 'Ketahui lebih lanjut tentang Minat Matematika, platform belajar dan simulasi tryout matematika dengan antarmuka modern, cepat, dan responsif.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>
          Tentang <span className={styles.highlight}>Minat Matematika</span>
        </h1>
        <p className={styles.subtitle}>
          Platform belajar dan simulasi tryout matematika untuk persiapan SNBT/UTBK dalam genggaman Anda.
        </p>
      </header>
      
      <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Siapa Kami?</h3>
          <p>
            <strong>Minat Matematika</strong> lahir dari keinginan sederhana: menciptakan tempat belajar dan berlatih soal matematika yang nyaman, cepat, dan modern.
            <br /><br />
            Kami menyadari betapa sulitnya menemukan platform tryout mandiri yang rapi dengan tampilan yang enak dipandang mata. Oleh karena itu, website ini dibangun dengan fokus pada <strong>User Experience</strong>. Tidak ada iklan popup yang mengganggu, navigasi yang membingungkan, atau teks rumus yang sulit dibaca.
          </p>
      </section>

      <section className={styles.features}>
        <h3 className={styles.sectionTitle}>Kenapa Belajar di Sini?</h3>
        <div className={styles.gridFeature}>
          <div className={styles.featureItem}>
            <div className={styles.iconWrapper}>⚡</div>
            <h4>Super Cepat</h4>
            <p>Dibangun dengan teknologi web terbaru, halaman soal dan pembahasan dimuat dalam hitungan milidetik.</p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.iconWrapper}>🌙</div>
            <h4>Mode Gelap</h4>
            <p>Otomatis menyesuaikan dengan preferensi mata Anda. Belajar malam hari tanpa membuat mata cepat lelah.</p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.iconWrapper}>📱</div>
            <h4>Responsif</h4>
            <p>Tampilan sangat optimal di Laptop, Tablet, maupun Smartphone. Anda bisa berlatih soal di mana saja.</p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.iconWrapper}>Aa</div>
            <h4>Ukuran Teks</h4>
            <p>Ukuran teks dan rumus bisa diatur menjadi lebih besar atau kecil sesuai dengan kenyamanan membaca Anda.</p>
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <p>
          Terima kasih telah mempercayakan perjalanan belajar Anda bersama kami. 
          <br />
          <em>Mari raih skor maksimal!</em>
        </p>
        <Link href="/contact" className={styles.button}>
          Hubungi Kami
        </Link>
      </section>

    </div>
  );
}