// File: src/app/privacy/page.jsx
import React from 'react';
import Link from 'next/link';
import styles from '../styles/LandPages.module.css';

export const metadata = {
  title: 'Kebijakan Privasi | Minat Matematika',
  description: 'Kebijakan privasi penggunaan website Minat Matematika.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
        <header className={styles.hero}>
          <h1 className={styles.title}>
            Kebijakan Privasi <span className={styles.highlight}>Minat Matematika</span>
            </h1>
          <div className={styles.subtitle}>
              Terakhir Diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className={styles.content}>
          <p className={styles.intro}>
            Di <strong>Minat Matematika</strong>, privasi pengunjung kami sangatlah penting. Dokumen Kebijakan Privasi ini menguraikan secara rinci jenis informasi pribadi yang dikumpulkan dan dicatat oleh Minat Matematika serta bagaimana kami menggunakannya.
          </p>         
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>1. Informasi yang Kami Kumpulkan</h3>
            <p>
              <strong>Log Files</strong>. Seperti kebanyakan standar situs web lain, Minat Matematika menggunakan sistem log files. File-file ini mencatat pengunjung ketika mereka mengunjungi situs web. Informasi yang dikumpulkan oleh file log meliputi:
            </p>
            <ul>
              <li>Alamat Protokol Internet (IP address)</li>
              <li>Jenis browser yang digunakan</li>
              <li>Penyedia Layanan Internet (ISP)</li>
              <li>Stempel tanggal dan waktu (Timestamp)</li>
              <li>Halaman rujukan/keluar (Referring/exit pages)</li>
            </ul>
            <p>
              Tujuan informasi ini adalah untuk menganalisis tren, mengelola situs, melacak pergerakan pengguna di situs web, dan mengumpulkan informasi demografis. Informasi ini <strong>tidak</strong> terkait dengan informasi apa pun yang dapat diidentifikasi secara pribadi.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>2. Cookies dan Web Beacons</h3>
            <p>
              Minat Matematika menggunakan "cookies" untuk menyimpan informasi tentang preferensi pengunjung, merekam informasi spesifik pengguna pada halaman mana yang diakses atau dikunjungi pengguna, serta menyesuaikan konten halaman web kami berdasarkan jenis browser pengunjung atau informasi lain yang dikirimkan pengunjung melalui browser mereka.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>3. Mitra Iklan Kami (Google AdSense)</h3>
            <p>
              Beberapa pengiklan di situs kami mungkin menggunakan cookies dan web beacons. Mitra iklan kami meliputi <strong>Google</strong>.
            </p>
            <div className={styles.highlightBox}>
              <h4>DoubleClick DART Cookie</h4>
              <ul>
                <li>Google, sebagai vendor pihak ketiga, menggunakan cookies untuk menayangkan iklan di Minat Matematika.</li>
                <li>Penggunaan cookie DART oleh Google memungkinkannya menayangkan iklan kepada pengunjung situs kami berdasarkan kunjungan mereka ke Minat Matematika dan situs lainnya di internet.</li>
                <li>Pengguna dapat membatalkan penggunaan cookie DART dengan mengunjungi Kebijakan Privasi Jaringan Iklan dan Konten Google di URL berikut: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="nofollow noreferrer">https://policies.google.com/technologies/ads</a></li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>4. Kebijakan Privasi Pihak Ketiga</h3>
            <p>
              Kebijakan Privasi Minat Matematika tidak berlaku untuk pengiklan atau situs web lain. Karena itu, kami menyarankan Anda untuk membaca saksama Kebijakan Privasi masing-masing dari server iklan pihak ketiga ini untuk informasi yang lebih rinci.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>5. Persetujuan</h3>
            <p>
              Dengan menggunakan situs web kami, Anda dengan ini menyetujui Kebijakan Privasi kami dan menyetujui syarat & ketentuannya.
            </p>
          </section>

          <section className={styles.closing}>
            <p>
              Jika Anda memerlukan informasi lebih lanjut atau memiliki pertanyaan tentang kebijakan privasi kami, jangan ragu untuk menghubungi kami.
            </p>
            <Link href="/contact" className={styles.button}>
              Hubungi Kami
            </Link>
          </section>
        </div>
    </div>
  );
}