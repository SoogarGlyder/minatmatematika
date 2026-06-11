// File: src/app/disclaimer/page.jsx
import React from 'react';
import Link from 'next/link';
import styles from '../styles/LandPages.module.css';

export const metadata = {
  title: 'Disclaimer | Minat Matematika',
  description: 'Informasi penafian dan ketentuan penggunaan materi di Minat Matematika.',
};

export default function DisclaimerPage() {
  return (
      <div className={styles.container}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Disclaimer & Catatan</h1>
          <p className={styles.subtitle}>
            Harap dibaca dengan saksama sebelum menggunakan platform ini.
          </p>
        </header>

        <div className={styles.alertBox}>
          <div className={styles.alertIcon}>⚠️</div>
          <div className={styles.alertContent}>
            <h3>Penafian Afiliasi Resmi</h3>
            <p>
              <strong>Minat Matematika</strong> adalah platform edukasi independen. Kami <strong>tidak berafiliasi</strong>, didukung, atau disponsori oleh panitia penyelenggara ujian resmi negara seperti SNPMB, BPPP, maupun Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemdikbudristek).
            </p>
            <p className={styles.smallText}>
              Seluruh soal *tryout*, latihan, dan materi yang disajikan di situs ini disusun secara mandiri sebagai bahan simulasi dan pembelajaran, bukan bocoran soal ujian asli.
            </p>
          </div>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Bukan Jaminan Kelulusan</h3>
          <p>
            Kami berusaha sebaik mungkin menyajikan materi Penalaran Matematika dan Pengetahuan Kuantitatif yang relevan dan mutakhir. Namun, berlatih menggunakan website ini tidak menjamin 100% kelulusan Anda pada ujian seleksi masuk perguruan tinggi yang sesungguhnya.
          </p>
          <div className={styles.quoteBox}>
            <p>
              "Gunakan platform ini sebagai sarana pendamping belajar. Tetaplah mengacu pada buku pelajaran resmi dan perbanyak referensi belajar Anda."
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Catatan Pembuat Soal</h3>
          <p>
            Setiap pembahasan soal dikerjakan dengan penuh dedikasi agar mudah dipahami, namun kami menyadari kemungkinan adanya *human error*.
          </p>
          <ul>
            <li>
              <strong>Penyederhanaan Rumus:</strong> Kami mungkin menggunakan cara cepat atau penyederhanaan langkah yang sedikit berbeda dari buku cetak standar sekolah.
            </li>
            <li>
              <strong>Koreksi:</strong> Manusia tempatnya salah. Jika Anda menemukan kesalahan pada kunci jawaban atau perhitungan yang meleset, jangan ragu untuk berdiskusi di kolom komentar atau menghubungi kami.
            </li>
          </ul>
        </section>

        <section className={styles.closing}>
          <p>
            Menemukan kesalahan fatal pada rumus atau konten?
          </p>
          <Link href="/contact" className={styles.button}>
            Hubungi Kami
          </Link>
         </section>
      </div>
  );
}