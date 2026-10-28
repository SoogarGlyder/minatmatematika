// File: src/components/admin/PaketForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import PaketReportPanel from './PaketReportPanel';
import SoalToolbar from './SoalToolbar';
import { insertTemplate } from '@/lib/soalTemplates.mjs';

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
  const [report, setReport] = useState(null); // hasil pemeriksaan paket setelah disimpan
  const [toolbarNote, setToolbarNote] = useState('');
  const textareaRef = useRef(null);
  const lastSel = useRef(null);    // posisi kursor terakhir di kolom konten
  const pendingSel = useRef(null); // teks pengisi yang dipilih setelah kerangka disisipkan
  const [topicOptions, setTopicOptions] = useState([]);
  
  const isEditing = !!paketToEdit;

  // Posisi kursor lama tidak berlaku lagi saat berganti paket yang diedit
  useEffect(() => {
    lastSel.current = null;
  }, [paketToEdit]);

  // Setelah kerangka disisipkan: fokuskan kolom dan pilih teks pengisi pertama supaya langsung bisa diketik
  useEffect(() => {
    const el = textareaRef.current;
    if (pendingSel.current && el) {
      el.focus();
      el.setSelectionRange(pendingSel.current.start, pendingSel.current.end);
      pendingSel.current = null;
    }
  }, [formData.content]);

  const handleInsertTemplate = (id) => {
    if (id === 'teks-pendukung' && /teks\s+pendukung/i.test(formData.content)) {
      setToolbarNote('Teks pendukung sudah ada di paket ini.');
      return;
    }
    setToolbarNote('');
    const sel = lastSel.current; // kosong = sisipkan di akhir
    const result = insertTemplate(formData.content, sel?.start, sel?.end, id);
    pendingSel.current = { start: result.selectStart, end: result.selectEnd };
    setFormData((prev) => ({ ...prev, content: result.content }));
  };

  const rememberSelection = (e) => {
    lastSel.current = { start: e.target.selectionStart, end: e.target.selectionEnd };
  };

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
    setReport(null);

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

      const saved = await res.json().catch(() => null);
      if (saved?.report) setReport(saved.report);

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
      <PaketReportPanel report={report} onClose={() => setReport(null)} />
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
            <SoalToolbar onInsert={handleInsertTemplate} note={toolbarNote} />
            <textarea
                id="content"
                name="content"
                rows="15"
                ref={textareaRef}
                value={formData.content}
                onChange={handleChange}
                onSelect={rememberSelection}
                onBlur={rememberSelection}
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