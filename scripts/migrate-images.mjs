// File: scripts/migrate-images.mjs
// Memindahkan gambar soal ke folder public/images/soal supaya dilayani dari domain sendiri
// (tidak bergantung pada Postimg, WordPress lama, dll.) lalu mengganti alamatnya di konten.
//
//   node --env-file=.env.local scripts/migrate-images.mjs             # dry-run: daftar rencana, tidak menulis apa pun
//   node --env-file=.env.local scripts/migrate-images.mjs --download  # unduh gambar yang belum ada ke public/images/soal
//   node --env-file=.env.local scripts/migrate-images.mjs --write     # ganti alamat di database (hanya untuk gambar yang file lokalnya sudah ada)
//
// Gambar yang gagal diunduh dapat disimpan manual dari browser dengan NAMA FILE yang persis sama
// (lihat daftar di keluaran), lalu jalankan lagi dengan --write.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { planImageTargets } from './audit-lib.mjs';

const DOWNLOAD = process.argv.includes('--download');
const WRITE = process.argv.includes('--write');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destDir = path.join(root, 'public', 'images', 'soal');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI belum diset. Jalankan dengan: node --env-file=.env.local scripts/migrate-images.mjs');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const TARGETS = [
  { collection: 'paketsoals', field: 'content', label: 'paket' },
  { collection: 'articles', field: 'content', label: 'materi' },
  { collection: 'topics', field: 'description', label: 'topik' },
];

const docsByTarget = [];
const urls = new Set();
for (const t of TARGETS) {
  const docs = await db.collection(t.collection).find({ [t.field]: { $type: 'string' } }, { projection: { [t.field]: 1, slug: 1, paket_slug: 1 } }).toArray();
  docsByTarget.push({ ...t, docs });
  for (const d of docs) {
    for (const m of d[t.field].matchAll(/<img\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)["']/gi)) urls.add(m[1]);
  }
}

const plan = planImageTargets([...urls]);
const localPath = (target) => path.join(root, 'public', target.replace(/^\//, ''));
const exists = (target) => fs.existsSync(localPath(target));

console.log(`${WRITE ? 'MODE TULIS' : DOWNLOAD ? 'MODE UNDUH' : 'DRY-RUN (tidak menulis)'}: ${plan.size} alamat gambar luar ditemukan\n`);

if (DOWNLOAD) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const [url, target] of plan) {
    if (exists(target)) continue;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', Accept: 'image/*,*/*;q=0.8' },
      });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.startsWith('image/')) {
        console.log(`  gagal (${res.status} ${type || 'tanpa content-type'})  ${url}`);
        continue;
      }
      fs.writeFileSync(localPath(target), Buffer.from(await res.arrayBuffer()));
      console.log(`  terunduh  ${target}`);
    } catch (error) {
      console.log(`  gagal (${error.name === 'TimeoutError' ? 'timeout' : 'tidak bisa terhubung'})  ${url}`);
    }
  }
  console.log('');
}

const missing = [];
for (const [url, target] of plan) {
  const ok = exists(target);
  console.log(`${ok ? '✔' : '✗'} ${target}${ok ? '' : '   <- belum ada di public/images/soal'}\n    asal: ${url}`);
  if (!ok) missing.push({ url, target });
}

if (missing.length) {
  console.log(`\n${missing.length} gambar belum tersedia secara lokal. Simpan manual (klik kanan > Simpan gambar) dengan nama file persis:`);
  missing.forEach((m) => console.log(`  ${path.basename(m.target)}   dari ${m.url}`));
}

if (WRITE) {
  let changedDocs = 0;
  for (const { collection, field, docs } of docsByTarget) {
    const ops = [];
    for (const d of docs) {
      let next = d[field];
      for (const [url, target] of plan) {
        if (exists(target) && next.includes(url)) next = next.split(url).join(target);
      }
      if (next !== d[field]) {
        changedDocs++;
        ops.push({ updateOne: { filter: { _id: d._id }, update: { $set: { [field]: next } } } });
      }
    }
    if (ops.length) await db.collection(collection).bulkWrite(ops);
  }
  console.log(`\n${changedDocs} dokumen diperbarui. Jalankan ulang: node --env-file=.env.local scripts/migrate-questions.mjs --write`);
} else {
  console.log('\nIni bukan mode tulis. Tambahkan --write setelah semua gambar yang diperlukan ada di public/images/soal.');
}

await mongoose.disconnect();
