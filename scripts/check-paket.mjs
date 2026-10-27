// File: scripts/check-paket.mjs
// Memeriksa apakah satu paket akan memakai tryout baru atau CBT lama.
//   node --env-file=.env.local scripts/check-paket.mjs taman-kota/paket-01
import mongoose from 'mongoose';

const label = process.argv[2];
if (!label || !label.includes('/')) {
  console.error('Pemakaian: node --env-file=.env.local scripts/check-paket.mjs topik-slug/paket-slug');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI belum diset. Jalankan dengan --env-file=.env.local');
  process.exit(1);
}

const [topicSlug, paketSlug] = label.split('/');
await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const totalQuestions = await db.collection('questions').countDocuments();
console.log(`Total dokumen di koleksi questions: ${totalQuestions}`);

const topic = await db.collection('topics').findOne({ slug: topicSlug });
if (!topic) {
  console.log(`Topik "${topicSlug}" tidak ditemukan.`);
  await mongoose.disconnect();
  process.exit(0);
}
const paket = await db.collection('paketsoals').findOne({ topic: topic._id, paket_slug: paketSlug });
if (!paket) {
  console.log(`Paket "${paketSlug}" tidak ditemukan di topik "${topicSlug}".`);
  await mongoose.disconnect();
  process.exit(0);
}

const docs = await db.collection('questions').find({ paket: paket._id }).sort({ number: 1 }).toArray();
const ready = docs.filter((q) => !q.needsReview);

console.log(`\nPaket ${label}: ${docs.length} soal di koleksi questions, ${ready.length} siap dipakai\n`);
docs.forEach((q) => {
  console.log(
    `  no ${String(q.number).padStart(2)} | ${String(q.type).padEnd(7)} | opsi: ${(q.options || []).length} | ` +
      `teks pendukung: ${(q.supportHtml || '').length ? 'ada' : '-'} | ${q.needsReview ? 'needsReview' : 'siap'}`
  );
});

console.log(
  '\nHasil: ' +
    (ready.length > 0
      ? '/cbt/' + label + ' akan memakai TRYOUT BARU.'
      : '/cbt/' + label + ' akan memakai CBT LAMA' + (docs.length === 0 ? ' (paket ini belum ada di koleksi questions: jalankan migrate-questions.mjs --write).' : ' (semua soalnya needsReview).'))
);

await mongoose.disconnect();
