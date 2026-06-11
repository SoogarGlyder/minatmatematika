<<<<<<< HEAD
// File: src/app/admin/page.jsx
'use client';

import React, { useState, useEffect } from 'react'; 
import styles from './admin.module.css'; 

// Menggunakan nama komponen yang baru
import TopicListAdmin from '@/components/admin/TopicListAdmin'; 
import TopicForm from '@/components/admin/TopicForm'; 
import PaketListAdmin from '@/components/admin/PaketListAdmin';
import PaketForm from '@/components/admin/PaketForm';
import CommentListAdmin from '@/components/admin/CommentListAdmin';

import ArticleForm from '@/components/admin/ArticleForm';
import ArticleListAdmin from '@/components/admin/ArticleListAdmin';

export default function AdminDashboard() {
  const [topicToEdit, setTopicToEdit] = useState(null); 
  const [paketToEdit, setPaketToEdit] = useState(null);
  const [articleToEdit, setArticleToEdit] = useState(null); 

  const [refreshList, setRefreshList] = useState(false); 
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkResize = () => setIsMobile(window.innerWidth < 768);
    checkResize();
    window.addEventListener('resize', checkResize);

    const checkScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScroll);

    return () => {
        window.removeEventListener('resize', checkResize);
        window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSaveSuccess = () => {
    setTopicToEdit(null); 
    setPaketToEdit(null);
    setArticleToEdit(null);
    setRefreshList(prev => !prev); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditTopic = (topic) => {
    setPaketToEdit(null); setArticleToEdit(null);
    const form = document.getElementById('edit-topic-form');
    if(form) form.scrollIntoView({ behavior: 'smooth' });
    setTopicToEdit(topic);
  };
  
  const handleEditPaket = (paket) => {
    setTopicToEdit(null); setArticleToEdit(null);
    const form = document.getElementById('edit-paket-form');
    if(form) form.scrollIntoView({ behavior: 'smooth' });
    setPaketToEdit(paket);
  };

  const handleEditArticle = (article) => {
    setTopicToEdit(null); setPaketToEdit(null);
    const form = document.getElementById('edit-article-form');
    if(form) form.scrollIntoView({ behavior: 'smooth' });
    setArticleToEdit(article);
  };

  const scrollToSection = (id) => {
     setTopicToEdit(null); setPaketToEdit(null); setArticleToEdit(null);
     const element = document.getElementById(id);
     if(element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const listKey = refreshList ? 'refresh' : 'initial'; 

  if (isMobile) {
    return (
      <div className={styles.adminContainer} style={{ textAlign: 'center', padding: '50px', height: '100vh', alignContent: 'center'}}>
        <h1 style={{color: '#ff6347'}}>Akses Dibatasi</h1>
        <p>Dashboard Administrasi hanya dapat diakses pada layar dengan lebar minimal 769px (Desktop/Tablet besar).</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <h1>Dashboard Administrasi (CMS)</h1>
      
      <div className={styles.adminMenu}>
        <h2>Menu Cepat</h2>
        <ul>
          <li><a href="#kelola-topik" onClick={(e) => { e.preventDefault(); scrollToSection('kelola-topik'); }}>List Materi</a></li>
          <li><a href="#kelola-paket" onClick={(e) => { e.preventDefault(); scrollToSection('kelola-paket'); }}>List Paket Soal</a></li>
          <li><a href="#kelola-artikel" onClick={(e) => { e.preventDefault(); scrollToSection('kelola-artikel'); }}>List Artikel</a></li>
          <li><a href="#kelola-komentar" onClick={(e) => { e.preventDefault(); scrollToSection('kelola-komentar'); }}>Komentar</a></li>
          <li style={{ borderLeft: '2px solid #ccc', paddingLeft: '15px' }}>
             <a href="#edit-topic-form" onClick={(e) => { e.preventDefault(); scrollToSection('edit-topic-form'); }}>+ Materi Baru</a>
          </li>
          <li><a href="#edit-paket-form" onClick={(e) => { e.preventDefault(); scrollToSection('edit-paket-form'); }}>+ Paket Baru</a></li>
          <li><a href="#edit-article-form" onClick={(e) => { e.preventDefault(); scrollToSection('edit-article-form'); }}>+ Artikel Baru</a></li>
        </ul>
      </div>
      
      <section id="edit-topic-form" style={{ marginTop: '40px' }}>
          <h3 style={{ borderLeft: '5px solid var(--primary)', paddingLeft: '10px' }}>
             {topicToEdit ? `Edit Materi: ${topicToEdit.title}` : 'Buat Materi Baru'}
          </h3>
          <TopicForm 
            topicToEdit={topicToEdit}
            onSaveSuccess={handleSaveSuccess}
            styles={styles}
          />
      </section>
      
      <section id="edit-paket-form" style={{ marginTop: '40px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
          <h3 style={{ borderLeft: '5px solid #FF9800', paddingLeft: '10px' }}>
             {paketToEdit ? `Edit Paket: ${paketToEdit.title}` : 'Buat Paket Soal Baru'}
          </h3>
          <PaketForm 
            paketToEdit={paketToEdit}
            onSaveSuccess={handleSaveSuccess}
            styles={styles}
          />
      </section>

      <section id="edit-article-form" style={{ marginTop: '40px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
          <h3 style={{ borderLeft: '5px solid #4CAF50', paddingLeft: '10px' }}>
             {articleToEdit ? `Edit Artikel: ${articleToEdit.title}` : 'Buat Artikel Baru'}
          </h3>
          <ArticleForm 
            articleToEdit={articleToEdit}
            onSaveSuccess={handleSaveSuccess}
            styles={styles}
          />
      </section>

      <section id="kelola-topik" style={{ marginTop: '60px', borderTop: '4px solid #333', paddingTop: '30px' }}>
          <h2>Daftar Materi Matematika</h2>
          <TopicListAdmin 
            key={`topic-${listKey}`} 
            onEditTopic={handleEditTopic} 
            styles={styles}
          />
      </section>

      <section id="kelola-paket" style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <h2>Daftar Paket Soal</h2>
          <PaketListAdmin 
            key={`paket-${listKey}`}
            onEditPaket={handleEditPaket} 
            refreshToggle={refreshList}
            styles={styles}
          />
      </section>

      <section id="kelola-artikel" style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <h2>Daftar Artikel Blog</h2>
          <ArticleListAdmin 
             key={`article-${listKey}`}
             onEditArticle={handleEditArticle}
             refreshToggle={refreshList}
             styles={styles}
          />
      </section>

      <section id="kelola-komentar" style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px', paddingBottom: '100px' }}>
          <h2>Moderasi Komentar Netizen</h2>
          <p style={{marginBottom: '10px', color: '#666'}}>Hapus komentar yang mengandung spam atau kata kasar.</p>
          <CommentListAdmin 
             styles={styles}
          />
      </section>
      
      <button 
        className={`${styles.scrollTopBtn} ${showScrollTop ? styles.showScroll : ''}`} 
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
        title="Kembali ke atas"
      >
        ▲
      </button>

=======
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Selamat Datang, Bos!</h1>
      <p style={{ color: '#555', marginBottom: '30px' }}>
        Ini adalah Panel Admin yang hanya bisa diakses di komputermu sendiri (localhost). 
        Silakan pilih menu di bawah untuk mengelola data website Minat Matematika.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* KARTU MENU MATERI */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>📚 Kelola Deskripsi Materi</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
            Buat/Edit topik seperti "Penalaran Logis", "Aritmatika Sosial", dll agar muncul di Grid Majalah.
          </p>
          <Link href="/admin/materi" style={{ 
            display: 'inline-block', background: '#111', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' 
          }}>
            Masuk ke Materi »
          </Link>
        </div>

        {/* KARTU MENU PAKET SOAL */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>📝 Kelola Paket Soal</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
            Buat/Edit "Paket 01 - Penalaran Logis" beserta rumus matematika dan pembahasannya.
          </p>
          <Link href="/admin/posts" style={{ 
            display: 'inline-block', background: '#0070f3', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' 
          }}>
            Masuk ke Paket Soal »
          </Link>
        </div>

      </div>
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
    </div>
  );
}