// File: src/lib/soalTemplates.mjs
// Kerangka HTML soal untuk form admin. Setiap kerangka sudah diuji terbaca benar oleh parser
// (scripts/test-templates.mjs). Fungsi murni, tanpa DOM.

const NUMBER_RE = /<h3[^>]*>\s*Nomor\s+(\d+)\s*<\/h3>/gi;

// Nomor berikutnya = nomor terbesar yang sudah ada + 1
export function nextNumber(content) {
  let max = 0;
  for (const m of String(content || '').matchAll(NUMBER_RE)) max = Math.max(max, Number(m[1]));
  return max + 1;
}

const detailsBlock = (inner) => `<details>
  <summary>Lihat Pembahasan</summary>
  <div>
${inner}
  </div>
</details>
<hr />`;

export const TEMPLATES = [
  {
    id: 'teks-pendukung',
    label: 'Teks pendukung',
    hint: 'Disisipkan di awal paket; tampil di atas semua nomor.',
    position: 'start',
    select: 'Tulis teks, tabel, atau gambar pendukung di sini.',
    build: () => `<h3>Teks Pendukung</h3>
<p>Tulis teks, tabel, atau gambar pendukung di sini. Bagian ini tampil di atas SEMUA nomor pada paket ini.</p>
<hr />`,
  },
  {
    id: 'pilihan-ganda',
    label: 'Pilihan ganda',
    hint: 'Opsi A-E, kunci satu huruf.',
    position: 'cursor',
    select: 'Tulis pertanyaan di sini.',
    build: (n) => `<h3>Nomor ${n}</h3>
<p>Tulis pertanyaan di sini. Rumus ditulis di antara tanda dolar, misalnya $x^2 + 1$.</p>
<p>A. Pilihan A<br />B. Pilihan B<br />C. Pilihan C<br />D. Pilihan D<br />E. Pilihan E</p>
${detailsBlock(`    <p>Tulis langkah pembahasan di sini.</p>
    <p><strong>Jawaban: A</strong></p>`)}`,
  },
  {
    id: 'kompleks-ya-tidak',
    label: 'Kompleks (Ya/Tidak)',
    hint: 'Tabel pernyataan; didukung CBT baru dan CBT lama.',
    position: 'cursor',
    select: 'Tulis petunjuk soal di sini.',
    build: (n) => `<h3>Nomor ${n}</h3>
<p>Tulis petunjuk soal di sini.</p>
<table>
  <thead>
    <tr><th>Pernyataan</th><th>Ya</th><th>Tidak</th></tr>
  </thead>
  <tbody>
    <tr><td>Pernyataan 1</td><td></td><td></td></tr>
    <tr><td>Pernyataan 2</td><td></td><td></td></tr>
    <tr><td>Pernyataan 3</td><td></td><td></td></tr>
  </tbody>
</table>
${detailsBlock(`    <p>Pernyataan 1: <strong>YA</strong></p>
    <p>Tulis alasan pernyataan 1.</p>
    <p>Pernyataan 2: <strong>TIDAK</strong></p>
    <p>Tulis alasan pernyataan 2.</p>
    <p>Pernyataan 3: <strong>YA</strong></p>
    <p>Tulis alasan pernyataan 3.</p>`)}`,
  },
  {
    id: 'kompleks-benar-salah',
    label: 'Kompleks (Benar/Salah)',
    hint: 'Hanya tampil benar di CBT baru; CBT lama hanya mengenal Ya/Tidak.',
    position: 'cursor',
    select: 'Tulis petunjuk soal di sini.',
    build: (n) => `<h3>Nomor ${n}</h3>
<p>Tulis petunjuk soal di sini.</p>
<table>
  <thead>
    <tr><th>Pernyataan</th><th>Benar</th><th>Salah</th></tr>
  </thead>
  <tbody>
    <tr><td>Pernyataan 1</td><td></td><td></td></tr>
    <tr><td>Pernyataan 2</td><td></td><td></td></tr>
    <tr><td>Pernyataan 3</td><td></td><td></td></tr>
  </tbody>
</table>
${detailsBlock(`    <p>Pernyataan 1: <strong>BENAR</strong></p>
    <p>Tulis alasan pernyataan 1.</p>
    <p>Pernyataan 2: <strong>SALAH</strong></p>
    <p>Tulis alasan pernyataan 2.</p>
    <p>Pernyataan 3: <strong>BENAR</strong></p>
    <p>Tulis alasan pernyataan 3.</p>`)}`,
  },
  {
    id: 'isian-singkat',
    label: 'Isian singkat',
    hint: 'Jawaban berupa satu angka; satuan boleh ditulis di kunci.',
    position: 'cursor',
    select: 'Tulis pertanyaan di sini.',
    build: (n) => `<h3>Nomor ${n}</h3>
<p>Tulis pertanyaan di sini. (Jawab dengan bilangan cacah)</p>
${detailsBlock(`    <p><strong>Jawaban: 270</strong></p>
    <p>Tulis langkah pembahasan di sini.</p>`)}`,
  },
  {
    id: 'uraian',
    label: 'Uraian',
    hint: 'Tanpa kunci tunggal; tidak dinilai otomatis.',
    position: 'cursor',
    select: 'Tulis soal uraian di sini.',
    build: (n) => `<h3>Nomor ${n}</h3>
<p>Tulis soal uraian di sini.</p>
${detailsBlock(`    <p>Tulis langkah pembahasan di sini.</p>`)}`,
  },
  {
    id: 'uraian-bertahap',
    label: 'Uraian bertahap (a, b)',
    hint: 'Satu pembahasan per bagian soal.',
    position: 'cursor',
    select: 'Tulis pengantar soal di sini.',
    build: (n) => `<h3>Nomor ${n}</h3>
<p>Tulis pengantar soal di sini.<br />a. Bagian a<br />b. Bagian b</p>
<details>
  <summary>Lihat Pembahasan (a)</summary>
  <div>
    <p>Tulis pembahasan bagian a di sini.</p>
  </div>
</details>
<details style="margin-top: 10px;">
  <summary>Lihat Pembahasan (b)</summary>
  <div>
    <p>Tulis pembahasan bagian b di sini.</p>
  </div>
</details>
<hr />`,
  },
  {
    id: 'gambar',
    label: 'Gambar',
    hint: 'Pakai tautan langsung (i.postimg.cc), bukan tautan halaman.',
    position: 'cursor',
    select: 'GANTI-DENGAN-TAUTAN-LANGSUNG.png',
    build: () => `<p><img src="https://i.postimg.cc/GANTI-DENGAN-TAUTAN-LANGSUNG.png" alt="Deskripsi gambar" /></p>`,
  },
];

// Menyisipkan kerangka ke konten. selStart/selEnd = posisi kursor di textarea (boleh kosong = di akhir).
// Mengembalikan konten baru dan rentang teks pengisi yang sebaiknya langsung dipilih.
export function insertTemplate(content, selStart, selEnd, id) {
  const tpl = TEMPLATES.find((t) => t.id === id);
  if (!tpl) throw new Error(`Kerangka tidak dikenal: ${id}`);

  const current = String(content || '');
  const text = tpl.build(nextNumber(current));
  const placeholderAt = text.indexOf(tpl.select);

  if (tpl.position === 'start') {
    return {
      content: `${text}\n\n${current}`,
      selectStart: placeholderAt,
      selectEnd: placeholderAt + tpl.select.length,
    };
  }

  const start = Math.min(Math.max(selStart ?? current.length, 0), current.length);
  const end = Math.min(Math.max(selEnd ?? start, start), current.length);
  const before = current.slice(0, start);
  const after = current.slice(end);

  const prefix = !before || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const suffix = !after || after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';

  const base = before.length + prefix.length;
  return {
    content: `${before}${prefix}${text}${suffix}${after}`,
    selectStart: base + placeholderAt,
    selectEnd: base + placeholderAt + tpl.select.length,
  };
}
