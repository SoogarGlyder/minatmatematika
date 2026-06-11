'use client';

import React, { useState, useEffect } from 'react';
import styles from './CommentSection.module.css';

<<<<<<< HEAD
export default function CommentSection({ novelSlug, chapterSlug }) {
=======
export default function CommentSection({ kategoriSlug, paketSlug }) {
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState({ name: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
<<<<<<< HEAD
    if (chapterSlug) {
      fetchComments();
    }
  }, [chapterSlug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?chapterSlug=${chapterSlug}`);
=======
    if (paketSlug) {
      fetchComments();
    }
  }, [paketSlug]);

  const fetchComments = async () => {
    try {
      // Endpoint disesuaikan ke paketSlug
      const res = await fetch(`/api/comments?paketSlug=${paketSlug}`);
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
      const data = await res.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil komentar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
<<<<<<< HEAD
        setError("Nama dan komentar tidak boleh kosong.");
=======
        setError("Nama dan pesan tidak boleh kosong.");
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
        return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
<<<<<<< HEAD
          novelSlug,
          chapterSlug,
=======
          kategoriSlug, // Dikirim sesuai format baru
          paketSlug,    // Dikirim sesuai format baru
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
          name: formData.name,
          content: formData.content
        }),
      });

      const result = await res.json();
      
<<<<<<< HEAD
      console.log("Respon Server:", result); 

      if (!res.ok || !result.success) {
        const pesanError = result.error || result.message || "Terjadi kesalahan misterius.";
=======
      if (!res.ok || !result.success) {
        const pesanError = result.error || result.message || "Terjadi kesalahan sistem.";
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
        throw new Error(pesanError);
      }

      setFormData({ name: '', content: '' });
      fetchComments(); 
<<<<<<< HEAD
      alert("Komentar berhasil dikirim!");
=======
      alert("Pertanyaan/Komentar berhasil dikirim!");
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
<<<<<<< HEAD
      <h3 className={styles.title}>Komentar ({comments.length})</h3>
=======
      <h3 className={styles.title}>Diskusi & Komentar ({comments.length})</h3>
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Nama Kamu (Wajib)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
            required
            maxLength={50}
            disabled={submitting}
          />
        </div>
        <div className={styles.inputGroup}>
          <textarea
<<<<<<< HEAD
            placeholder="Tulis komentar..."
=======
            placeholder="Ada bagian yang kurang dipahami? Tanyakan di sini..."
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className={styles.textarea}
            required
            maxLength={1000}
            disabled={submitting}
          />
        </div>

        <button 
          type="submit" 
          className={styles.button} 
          disabled={submitting || !formData.name || !formData.content}
        >
          {submitting ? 'Mengirim...' : 'Kirim Komentar'}
        </button>

<<<<<<< HEAD
        {error && <p className={styles.message} style={{color: 'red', marginTop: '10px'}}>{error}</p>}
=======
        {error && <p className={styles.message} style={{color: 'red'}}>{error}</p>}
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
      </form>

      <div className={styles.list}>
        {loading ? (
<<<<<<< HEAD
          <p>Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <p style={{ opacity: 0.6 }}>Belum ada komentar. Jadilah yang pertama!</p>
=======
          <p style={{ opacity: 0.7 }}>Memuat diskusi...</p>
        ) : comments.length === 0 ? (
          <p style={{ opacity: 0.6 }}>Belum ada diskusi di paket ini. Jadilah yang pertama bertanya!</p>
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className={styles.item}>
              <div className={styles.header}>
                <span className={styles.author}>{comment.name}</span>
                <span className={styles.date}>
                  {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                  })}
                </span>
              </div>
              <p className={styles.content}>{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}