// File: scripts/audit-content.mjs
// Audit konten (hanya membaca, tidak mengubah apa pun): paket soal, artikel, dan deskripsi materi.
//
//   node --env-file=.env.local scripts/audit-content.mjs > laporan-konten.txt 2>&1
//   node --env-file=.env.local scripts/audit-content.mjs --check-urls > laporan-konten.txt 2>&1
//
// --check-urls juga membuka setiap alamat gambar https untuk melihat apakah masih tersedia (butuh internet).
// Catatan: status 403 sering berarti server menolak pengecekan otomatis; buka alamatnya di browser untuk memastikan.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import nextConfig from '../next.config.mjs';
import { analyzeHtml, hasIssues, hostMatches } from './audit-lib.mjs';

const CHECK_URLS = process.argv.includes('--check-urls');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const patterns = (nextConfig.images?.remotePatterns || []).filter((p) => !p.protocol || p.protocol === 'https');

const env = {
  isHostAllowed: (host) => patterns.some((p) => hostMatches(host, p.hostname)),
  publicHas: (p) => fs.existsSync(path.join(root, 'public', p)),
};

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI belum diset. Jalankan dengan: node --env-file=.env.local scripts/audit-content.mjs');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const topics = await db.collection('topics').find({}, { projection: { slug: 1, description: 1 } }).toArray();
const topicSlugById = new Map(topics.map((t) => [String(t._id), t.slug]));

const sources = [];
for (const p of await db.collection('paketsoals').find({}, { projection: { topic: 1, paket_slug: 1, content: 1 } }).toArray()) {
  sources.push({ label: `paket  ${topicSlugById.get(String(p.topic)) || '?'}/${p.paket_slug}`, html: p.content });
}
for (const a of await db.collection('articles').find({}, { projection: { slug: 1, content: 1 } }).toArray()) {
  sources.push({ label: `materi ${a.slug}`, html: a.content });
}
for (const t of topics) sources.push({ label: `topik  ${t.slug}`, html: t.description });

console.log(`Audit konten: ${sources.length} dokumen diperiksa (paket, artikel, deskripsi topik)\n`);

const totals = { docs: 0, entities: 0, imageProblems: 0, oddDollar: 0, pMismatch: 0 };
const imageUrls = new Map(); // url -> [label]

for (const { label, html } of sources) {
  const r = analyzeHtml(html, env);
  r.images.forEach((i) => {
    if (i.src.startsWith('http')) {
      const list = imageUrls.get(i.src) || [];
      list.push(label);
      imageUrls.set(i.src, list);
    }
  });
  if (!hasIssues(r)) continue;

  totals.docs++;
  console.log(label);
  for (const [entity, n] of Object.entries(r.entities)) {
    totals.entities += n;
    console.log(`  ! entitas tidak dikenali ${entity} (${n}x)${entity === '&dots;' ? ' -> bisa diperbaiki otomatis: scripts/fix-content.mjs' : ' -> cek manual'}`);
  }
  for (const [entity, n] of Object.entries(r.doubleEscaped)) {
    totals.entities += n;
    console.log(`  ! entitas tersimpan ganda ${entity} (${n}x), tampil mentah di halaman -> bisa diperbaiki otomatis: scripts/fix-content.mjs`);
  }
  r.images.filter((i) => i.problem).forEach((i) => {
    totals.imageProblems++;
    console.log(`  ! gambar: ${i.problem}\n      ${i.src || '(kosong)'}`);
  });
  if (r.oddDollar.length) {
    totals.oddDollar += r.oddDollar.length;
    console.log(`  ! tanda $ ganjil (rumus mungkin tidak tertutup) di ${r.oddDollar.length} baris, contoh:`);
    r.oddDollar.slice(0, 3).forEach((s) => console.log(`      "${s}"`));
  }
  if (r.pMismatch) {
    totals.pMismatch++;
    console.log(`  ! tag <p> tidak seimbang: ${r.pMismatch.open} dibuka, ${r.pMismatch.close} ditutup`);
    r.pWhere.slice(0, 6).forEach((w) => console.log(`      ${w.number ? 'Nomor ' + w.number : 'bagian awal'}: ${w.open} dibuka, ${w.close} ditutup  "${w.snippet}"`));
  }
}

if (CHECK_URLS && imageUrls.size) {
  console.log(`\nMemeriksa ${imageUrls.size} alamat gambar unik...`);
  const urls = [...imageUrls.keys()];
  const failed = [];
  let cursor = 0;
  const worker = async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      let status = 'error';
      for (const method of ['HEAD', 'GET']) {
        try {
          const res = await fetch(url, { method, signal: AbortSignal.timeout(8000), redirect: 'follow' });
          status = res.status;
          if (res.ok) break;
        } catch (error) {
          status = error.name === 'TimeoutError' ? 'timeout' : 'gagal terhubung';
        }
      }
      if (status !== 200) failed.push({ url, status, where: imageUrls.get(url) });
    }
  };
  await Promise.all(Array.from({ length: 5 }, worker));

  if (failed.length === 0) console.log('Semua alamat gambar dapat dibuka.');
  failed.forEach((f) => {
    console.log(`  ! ${f.status}  ${f.url}`);
    [...new Set(f.where)].slice(0, 4).forEach((w) => console.log(`      dipakai di: ${w}`));
  });
}

console.log(
  `\nRingkasan: ${totals.docs} dokumen bermasalah. ` +
    `Entitas tidak dikenali: ${totals.entities}, gambar bermasalah: ${totals.imageProblems}, ` +
    `baris dengan $ ganjil: ${totals.oddDollar}, dokumen dengan <p> tidak seimbang: ${totals.pMismatch}.`
);
if (!CHECK_URLS) console.log('Tambahkan --check-urls untuk memeriksa apakah alamat gambar benar-benar bisa dibuka.');

await mongoose.disconnect();
