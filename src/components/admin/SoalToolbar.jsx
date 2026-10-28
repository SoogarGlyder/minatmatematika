// File: src/components/admin/SoalToolbar.jsx
// Tombol kerangka HTML soal + panduan format singkat, ditampilkan di atas kolom konten paket.
import React from 'react';
import { TEMPLATES } from '@/lib/soalTemplates.mjs';

const btn = {
  padding: '6px 10px',
  fontSize: '0.85rem',
  borderRadius: '6px',
  border: '1px solid var(--input-border, #ccc)',
  background: 'var(--input-bg, #f7f7f7)',
  color: 'inherit',
  cursor: 'pointer',
};

const guideBox = {
  margin: '8px 0 10px',
  padding: '8px 12px',
  border: '1px dashed var(--input-border, #ccc)',
  borderRadius: '8px',
  fontSize: '0.88rem',
  lineHeight: 1.6,
};

export default function SoalToolbar({ onInsert, note }) {
  return (
    <div style={{ margin: '4px 0 6px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>Sisipkan kerangka:</span>
        {TEMPLATES.map((t) => (
          <button key={t.id} type="button" style={btn} title={t.hint} onClick={() => onInsert(t.id)}>
            + {t.label}
          </button>
        ))}
      </div>

      <p style={{ margin: '6px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
        Kerangka masuk di posisi kursor (teks pendukung selalu di awal). Nomor soal otomatis = nomor terbesar + 1.
        {note ? <strong style={{ color: '#c77700' }}> {note}</strong> : null}
      </p>

      <details style={guideBox}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Panduan format soal</summary>
        <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
          <li>Setiap soal diawali <code>&lt;h3&gt;Nomor N&lt;/h3&gt;</code> dengan nomor berurutan.</li>
          <li><strong>Pilihan ganda:</strong> semua opsi dalam satu <code>&lt;p&gt;</code>, dipisah <code>&lt;br /&gt;</code>, huruf kapital <code>A.</code> sampai <code>E.</code>. Kunci: <code>&lt;strong&gt;Jawaban: X&lt;/strong&gt;</code> di dalam pembahasan.</li>
          <li><strong>Kompleks:</strong> tabel dengan satu baris per pernyataan, dan di pembahasan <code>Pernyataan N: &lt;strong&gt;YA&lt;/strong&gt;</code> (atau TIDAK/BENAR/SALAH). Benar/Salah hanya tampil benar di CBT baru.</li>
          <li><strong>Isian singkat:</strong> <code>&lt;strong&gt;Jawaban: 270&lt;/strong&gt;</code>. Hanya satu angka; satuan boleh ditulis dan diabaikan saat menilai.</li>
          <li><strong>Uraian:</strong> tanpa baris <code>Jawaban:</code> dan tanpa opsi, cukup pembahasan. Tidak dinilai otomatis.</li>
          <li>Rumus ditulis di antara tanda dolar, misalnya <code>$x^2$</code>. Untuk titik tiga di luar rumus pakai <code>&amp;hellip;</code>, jangan <code>&amp;dots;</code>.</li>
          <li>Gambar: pakai tautan langsung (<code>i.postimg.cc/...</code>), bukan tautan halaman <code>postimg.cc/...</code>.</li>
          <li>Setelah menyimpan, perhatikan panel &quot;Hasil pemeriksaan paket&quot; di pojok kanan bawah.</li>
        </ul>
      </details>
    </div>
  );
}
