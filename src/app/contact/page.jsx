// File: src/app/contact/page.jsx
import React from 'react';
import styles from '../styles/LandPages.module.css';

export const metadata = {
  title: 'Hubungi Kami | Minat Matematika',
  description: 'Hubungi tim Minat Matematika untuk memberikan saran, melaporkan kesalahan pada soal, request materi, atau mendiskusikan peluang kerjasama.',
};

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>
          Hubungi <span className={styles.highlight}>Minat Matematika</span>
        </h1>
        <p className={styles.subtitle}>
          Punya pertanyaan, saran, atau menemukan kesalahan pada soal? Kami siap mendengar dari Anda.
        </p>
      </header>

      <div className={styles.gridContact}>
        <div className={styles.contactCard}>
          <div className={styles.iconWrapper}>
            📬
          </div>
          <h3>Email Support</h3>
          <p>Cara tercepat untuk menghubungi kami adalah melalui email. Kami berusaha membalas dalam 1x24 jam.</p>
          
          <div className={styles.emailBox}>
            <span className={styles.emailLabel}>Official Email:</span>
            <a href="mailto:halo@minatmatematika.com" className={styles.emailLink}>
              halo@minatmatematika.com
            </a>
          </div>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Apa yang bisa kami bantu?</h3>
          <ul className={styles.topicList}>
            <li>
              <strong>🐞 Lapor Kesalahan Soal / Rumus</strong>
              <p>Jika ada kunci jawaban yang keliru, gambar soal tidak muncul, atau rumus yang *typo*.</p>
            </li>
            <li>
              <strong>📚 Request Materi</strong>
              <p>Punya saran materi (seperti Geometri, Statistika, dll) yang belum tersedia di sini?</p>
            </li>
            <li>
              <strong>©️ Pertanyaan Konten</strong>
              <p>Jika Anda pendidik atau penerbit dan ingin mendiskusikan penggunaan konten di situs ini.</p>
            </li>
            <li>
              <strong>🤝 Kerjasama Edukasi</strong>
              <p>Untuk pertanyaan seputar promosi, kolaborasi *tryout*, atau kerjasama lainnya.</p>
            </li>
          </ul>
        </section>

      </div>

      <div className={styles.faqSection}>
        <h3>Sering Ditanyakan (FAQ)</h3>
        <div className={styles.faqItem}>
          <h4>Apakah saya bisa menjadi kontributor pembuat soal?</h4>
          <p>Tentu saja! Jika Anda seorang guru, tutor, atau mahasiswa yang suka membuat soal matematika berstandar SNBT/UTBK, silakan kirimkan portofolio atau contoh soal Anda ke email kami.</p>
        </div>
      </div>

    </div>
  );
}