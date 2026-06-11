// File: src/components/admin/PaketForm.jsx
import React, { useState, useEffect } from 'react';

const initialPaketState = {
  topic: '',
  title: '',
  paket_number: '',
  paket_slug: '',
  content: '',
};

function PaketForm({ paketToEdit, onSaveSuccess, styles }) {
  const [formData, setFormData] = useState(initialPaketState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [topicOptions, setTopicOptions] = useState([]);
  
  const isEditing = !!paketToEdit;

  useEffect(() => {
    const fetchTopics = async () => {
        try {
            const response = await fetch('/api/topics'); 
            const data = await response.json();
            
            // Pengamanan: memastikan format yang diterima adalah Array
            const formattedData = Array.isArray(data) ? data : (data.data || []);
            setTopicOptions(formattedData);

            if (!isEditing && formattedData.length > 0) {
                setFormData(prev => ({ ...prev, topic: formattedData[0]._id }));
            }
        } catch (err) {
            console.error("Gagal memuat topik:", err);
        }
    };
    fetchTopics();
  }, [isEditing]);

  useEffect(() => {
    if (paketToEdit) {
      setFormData({
        topic: paketToEdit.topic?._id || paketToEdit.topic,
        title: paketToEdit.title,
        paket_number: paketToEdit.paket_number,
        content: paketToEdit.content,
        paket_slug: paketToEdit.paket_slug,
        _id: paketToEdit._id 
      });
    } else {
      setFormData(prev => ({ 
          ...initialPaketState, 
          topic: topicOptions.length > 0 ? topicOptions[0]._id : ''
      }));
    }
  }, [paketToEdit, topicOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = { 
        ...formData, 
        paket_number: Number(formData.paket_number) 
    };

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing 
        ? `/api/packets/${formData._id}` 
        : '/api/packets';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // PERUBAHAN UTAMA: Membaca error asli dari API / Database
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || errData.message || "Gagal menyimpan paket soal");
      }

      setSuccess(`Paket soal berhasil di${isEditing ? 'perbarui' : 'buat'}!`);
      if (!isEditing) {
        setFormData(prev => ({ 
            ...initialPaketState, 
            topic: prev.topic 
        }));
      }
      onSaveSuccess();
      
    } catch (err) {
      setError(err.message); // Menampilkan pesan error tersebut ke warna merah di atas tombol
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.novelForm}>
      {error && <p className={styles.error} style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      {success && <p className={styles.success} style={{ color: 'green', fontWeight: 'bold' }}>{success}</p>}
      
      {topicOptions.length > 0 ? (
          <>
            <label htmlFor="topic">Materi Induk</label>
            <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
            >
                {topicOptions.map(topic => (
                    <option key={topic._id} value={topic._id}>
                        {topic.title} ({topic.category})
                    </option>
                ))}
            </select>
            
            <label htmlFor="title">Judul Paket Soal</label>
            <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Contoh: Uji Kompetensi 1"
            />
            
            <label htmlFor="paket_number">Nomor Urut Paket</label>
            <input
                id="paket_number"
                name="paket_number"
                type="number"
                value={formData.paket_number}
                onChange={handleChange}
                required
                placeholder="Contoh: 1"
            />

            <label htmlFor="paket_slug">Slug URL Paket</label>
            <input
                id="paket_slug"
                name="paket_slug"
                type="text"
                value={formData.paket_slug}
                onChange={handleChange}
                placeholder="contoh: uk-1"
            />

            <label htmlFor="content">Konten Soal & Pembahasan (HTML)</label>
            <textarea
                id="content"
                name="content"
                rows="15"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tulis soal dan pembahasan menggunakan tag HTML di sini..."
            />

            <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
                {loading ? 'Memproses...' : (isEditing ? 'Update Paket' : 'Simpan Paket')}
            </button>
          </>
      ) : (
          <p>Memuat Daftar Materi...</p>
      )}
    </form>
  );
}

export default PaketForm;