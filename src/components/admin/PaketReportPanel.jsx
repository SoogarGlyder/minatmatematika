// File: src/components/admin/PaketReportPanel.jsx
// Panel hasil pemeriksaan paket setelah disimpan. Tampil melayang di pojok layar supaya tetap terlihat
// walau halaman admin otomatis digulir ke atas setelah menyimpan.
import React from 'react';

const box = {
  position: 'fixed',
  right: '16px',
  bottom: '16px',
  width: 'min(440px, calc(100vw - 32px))',
  maxHeight: '60vh',
  overflowY: 'auto',
  zIndex: 1000,
  background: 'var(--card-bg, #fff)',
  color: 'var(--foreground, #222)',
  borderRadius: '10px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
  padding: '14px 16px',
  fontSize: '0.9rem',
  lineHeight: 1.5,
};

const list = { margin: '6px 0 0', paddingLeft: '18px' };

export default function PaketReportPanel({ report, onClose }) {
  if (!report) return null;

  const q = report.questions || {};
  const c = report.content || {};
  const entities = Object.entries(c.entities || {});
  const images = c.images || [];
  const oddDollar = c.oddDollar || [];
  const pWhere = c.pWhere || [];
  const notes = report.notes || [];
  const hasProblem = !report.ok || report.synced === false;

  return (
    <div style={{ ...box, borderLeft: `6px solid ${hasProblem ? '#f39c12' : '#2ed573'}` }} role="status">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <strong>Hasil pemeriksaan paket</strong>
        <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'inherit' }} aria-label="Tutup">×</button>
      </div>

      <p style={{ margin: '8px 0 0' }}>
        {q.total === 0
          ? 'Tidak ada soal terbaca di paket ini (tidak ada penanda "Nomor N").'
          : `${q.total} soal terbaca: ${q.single} pilihan ganda, ${q.complex} kompleks, ${q.short} isian, ${q.essay} uraian.`}
        {q.removed > 0 || report.removed > 0 ? ` ${report.removed} soal lama dibuang dari tryout.` : ''}
      </p>

      {report.synced === false && (
        <p style={{ margin: '8px 0 0', color: '#b3261e' }}>
          Paket tersimpan, tetapi sinkron ke tryout gagal ({report.error}). Jalankan <code>migrate-questions.mjs --write</code> sebagai cadangan.
        </p>
      )}

      {!hasProblem && (
        <p style={{ margin: '8px 0 0', color: '#1b7f3b', fontWeight: 600 }}>Tidak ada masalah ditemukan. Soal siap dipakai di CBT.</p>
      )}

      {q.needsReview > 0 && (
        <p style={{ margin: '8px 0 0', color: '#c77700', fontWeight: 600 }}>
          {q.needsReview} soal perlu diperbaiki dan dilewati di CBT sampai HTML-nya diperbaiki lalu disimpan ulang.
        </p>
      )}

      {notes.length > 0 && (
        <ul style={list}>
          {notes.slice(0, 12).map((n, i) => <li key={i}>{n}</li>)}
          {notes.length > 12 && <li>…dan {notes.length - 12} catatan lain.</li>}
        </ul>
      )}

      {entities.length > 0 && (
        <p style={{ margin: '8px 0 0' }}>
          Entitas HTML bermasalah: {entities.map(([e, n]) => `${e} (${n}x)`).join(', ')}. Ganti dengan <code>&amp;hellip;</code> atau tuliskan sebagai rumus.
        </p>
      )}

      {images.length > 0 && (
        <ul style={list}>
          {images.slice(0, 6).map((img, i) => (
            <li key={i}>Gambar: {img.problem}<br /><span style={{ wordBreak: 'break-all', opacity: 0.8 }}>{img.src || '(kosong)'}</span></li>
          ))}
        </ul>
      )}

      {oddDollar.length > 0 && (
        <p style={{ margin: '8px 0 0' }}>
          Tanda <code>$</code> ganjil di {oddDollar.length} baris (rumus mungkin tidak tertutup), contoh: &ldquo;{oddDollar[0]}&rdquo;
        </p>
      )}

      {pWhere.length > 0 && (
        <p style={{ margin: '8px 0 0' }}>
          Tag &lt;p&gt; tidak seimbang di: {pWhere.slice(0, 8).map((w) => (w.number ? `Nomor ${w.number}` : 'bagian awal')).join(', ')}.
        </p>
      )}
    </div>
  );
}
