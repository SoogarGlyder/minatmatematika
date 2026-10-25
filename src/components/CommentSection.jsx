'use client';

import React, { useState, useEffect } from 'react';
import styles from './CommentSection.module.css';

export default function CommentSection({ topicSlug, paketSlug }) {
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState({ name: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topicSlug && paketSlug) {
      fetchComments();
    }
  }, [topicSlug, paketSlug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `/api/comments?topicSlug=${encodeURIComponent(topicSlug)}&paketSlug=${encodeURIComponent(paketSlug)}`
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setComments(data);
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
        setError("Nama dan komentar tidak boleh kosong.");
        return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicSlug,
          paketSlug,
          name: formData.name,
          content: formData.content
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        const pesanError = result.error || result.message || "Terjadi kesalahan misterius.";
        throw new Error(pesanError);
      }

      setFormData({ name: '', content: '' });
      fetchComments(); 
      alert("Komentar berhasil dikirim!");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Komentar ({comments.length})</h3>

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
            placeholder="Tulis komentar..."
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

        {error && <p className={styles.message} style={{color: 'red', marginTop: '10px'}}>{error}</p>}
      </form>

      <div className={styles.list}>
        {loading ? (
          <p>Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <p style={{ opacity: 0.6 }}>Belum ada komentar. Jadilah yang pertama!</p>
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