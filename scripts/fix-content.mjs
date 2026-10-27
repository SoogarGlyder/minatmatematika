// File: scripts/fix-content.mjs
// Perbaikan otomatis yang aman: "&dots;" dan "&amp;dots;" menjadi "&hellip;", serta entitas ganda lain (mis. "&amp;nbsp;") menjadi satu.
//
//   node --env-file=.env.local scripts/fix-content.mjs           # dry-run: hanya melaporkan
//   node --env-file=.env.local scripts/fix-content.mjs --write   # menulis perubahan
//
// Setelah --write, jalankan ulang: node --env-file=.env.local scripts/migrate-questions.mjs --write
// supaya koleksi `questions` ikut memakai konten yang sudah diperbaiki.
import mongoose from 'mongoose';
import { DOUBLE_ESCAPED } from './audit-lib.mjs';

const WRITE = process.argv.includes('--write');
// "&dots;" bukan entitas HTML yang valid; "&amp;dots;" (tersimpan ganda) tampil mentah sebagai teks.
const DOUBLE_RE = new RegExp(`&amp;(${DOUBLE_ESCAPED.join('|')});`, 'g');
const FIXES = [
  [/&dots;/g, '&hellip;'],
  [DOUBLE_RE, (_, name) => (name === 'dots' ? '&hellip;' : `&${name};`)],
];
const TARGETS = [
  { collection: 'paketsoals', field: 'content', label: 'paket' },
  { collection: 'articles', field: 'content', label: 'materi' },
  { collection: 'topics', field: 'description', label: 'topik' },
];

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI belum diset. Jalankan dengan: node --env-file=.env.local scripts/fix-content.mjs');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
console.log(WRITE ? 'MODE TULIS' : 'DRY-RUN (tidak menulis)', '\n');

let changedDocs = 0;
for (const { collection, field, label } of TARGETS) {
  const docs = await db.collection(collection).find({ [field]: { $type: 'string' } }, { projection: { [field]: 1, slug: 1, paket_slug: 1, title: 1 } }).toArray();
  const ops = [];

  for (const doc of docs) {
    let next = doc[field];
    let count = 0;
    for (const [re, to] of FIXES) {
      next = next.replace(re, (...args) => {
        count++;
        return typeof to === 'function' ? to(...args) : to;
      });
    }
    if (count > 0) {
      changedDocs++;
      console.log(`  ${label} ${doc.slug || doc.paket_slug || doc.title || doc._id}: ${count} penggantian`);
      ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: { [field]: next } } } });
    }
  }

  if (WRITE && ops.length) await db.collection(collection).bulkWrite(ops);
}

console.log(`\n${changedDocs} dokumen ${WRITE ? 'diperbarui' : 'akan diperbarui'}.`);
if (!WRITE) console.log('Ini dry-run. Tambahkan --write untuk menerapkan.');
await mongoose.disconnect();
