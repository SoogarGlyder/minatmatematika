// File: scripts/migrate-questions.mjs
// Memecah konten HTML paket soal (koleksi paketsoals) menjadi dokumen Question.
//
//   node --env-file=.env.local scripts/migrate-questions.mjs                # dry-run semua paket (tidak menulis apa pun)
//   node --env-file=.env.local scripts/migrate-questions.mjs --paket=uk-1   # dry-run paket ber-slug uk-1 (boleh juga topik/slug)

//   node --env-file=.env.local scripts/migrate-questions.mjs --sample=topik/uk-1   # cetak contoh soal tanpa kunci (untuk diagnosis format)
//   node --env-file=.env.local scripts/migrate-questions.mjs --write        # benar-benar menulis ke database
//
// Aman dijalankan ulang: memakai upsert per (paket, nomor). Paket lama TIDAK diubah/dihapus.
// Catatan: menjalankan ulang dengan --write menimpa stemHtml/options/answer/explanationHtml
// soal yang sudah ada, tapi tidak menyentuh difficulty dan tags.
import mongoose from 'mongoose';
import { parsePacketContent } from '../src/lib/parsePacketContent.mjs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');

const only = args.find((a) => a.startsWith('--paket='))?.split('=')[1];
const sample = args.find((a) => a.startsWith('--sample='))?.split('=')[1];

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI belum diset. Jalankan dengan: node --env-file=.env.local scripts/migrate-questions.mjs');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const topics = await db.collection('topics').find({}, { projection: { slug: 1 } }).toArray();
const topicSlugById = new Map(topics.map((t) => [String(t._id), t.slug]));

const all = await db.collection('paketsoals').find({}).toArray();
const labelOf = (p) => `${topicSlugById.get(String(p.topic)) || '?'}/${p.paket_slug || p.title}`;

const filter = sample || only;
const pakets = filter ? all.filter((p) => labelOf(p) === filter || p.paket_slug === filter) : all;
console.log(`${WRITE ? 'MODE TULIS' : 'DRY-RUN (tidak menulis)'}: ${pakets.length} paket dipilih dari ${all.length}\n`);

const hasKey = (q) => (Array.isArray(q.answer) ? q.answer.length > 0 : Boolean(q.answer));
const compact = (nums) => (nums.length > 8 ? `${nums.slice(0, 8).join(', ')}, ... (${nums.length} nomor)` : nums.join(', '));

let totalQuestions = 0;
let totalMissing = 0;
let paketsWithMissing = 0;
let infoCount = 0;
let otherWarnings = 0;

for (const paket of pakets) {
  const { questions, warnings, supportHtml } = parsePacketContent(paket.content);
  const complex = questions.filter((q) => q.type === 'complex').length;
  const shortCount = questions.filter((q) => q.type === 'short').length;
  const essayCount = questions.filter((q) => q.type === 'essay').length;
  const missing = questions.filter((q) => q.type !== 'essay' && !hasKey(q));
  const lastNumber = questions.length ? questions[questions.length - 1].number : null;

  // Pisahkan peringatan ringan (info) dari yang perlu diperiksa
  const notes = [];
  for (const w of warnings) {
    if (/kunci jawaban tidak ditemukan|kunci jawaban tidak ditemukan\./.test(w)) continue; // dirangkum di bawah
    const isSupport = /teks pendukung/i.test(w);
    const isOutro = /ada konten setelah pembahasan/.test(w) && w.startsWith(`Nomor ${lastNumber}:`);
    if (isSupport || isOutro) infoCount++;
    else notes.push(w);
  }

  const label = labelOf(paket);
  const status = missing.length || notes.length ? '⚠' : '✔';
  console.log(
    `${status} ${label}: ${questions.length} soal, ${questions.length - missing.length - essayCount} berkunci ` +
      `(${complex} kompleks, ${shortCount} isian, ${essayCount} uraian), ${missing.length} tanpa kunci`
  );
  if (missing.length) console.log(`    ! tanpa kunci: nomor ${compact(missing.map((q) => q.number))}`);
  notes.forEach((w) => console.log(`    ! ${w}`));

  if (sample) {
    for (const q of missing.slice(0, 6)) {
      const e = q.explanationHtml;
      console.log(`\n=== NOMOR ${q.number} | opsi terbaca: ${q.options.length} | tipe: ${q.type}`);
      console.log(`--- soal (500 karakter pertama) ---\n${q.stemHtml.slice(0, 500)}`);
      console.log(`--- pembahasan (awal 250) ---\n${e.slice(0, 250)}`);
      console.log(`--- pembahasan (akhir 450) ---\n${e.length > 250 ? e.slice(-450) : '(sama dengan di atas)'}`);
    }
    console.log('');
  }

  totalQuestions += questions.length;
  totalMissing += missing.length;
  otherWarnings += notes.length;
  if (missing.length) paketsWithMissing++;

  if (WRITE && questions.length) {
    const now = new Date();
    await db.collection('questions').bulkWrite(
      questions.map((q) => ({
        updateOne: {
          filter: { paket: paket._id, number: q.number },
          update: {
            $set: {
              topic: paket.topic,
              type: q.type,
              supportHtml,
              stemHtml: q.stemHtml,
              options: q.options,
              statements: q.statements,
              answer: q.answer,
              acceptedAnswers: q.acceptedAnswers,
              needsReview: q.needsReview,
              explanationHtml: q.explanationHtml,
              updatedAt: now,
            },
            $setOnInsert: { paket: paket._id, number: q.number, tags: [], createdAt: now },
          },
          upsert: true,
        },
      }))
    );
  }
}

console.log(
  `\nTotal: ${totalQuestions} soal dari ${pakets.length} paket. ` +
    `Tanpa kunci: ${totalMissing} soal di ${paketsWithMissing} paket. ` +
    `Peringatan lain: ${otherWarnings}. Catatan ringan disembunyikan: ${infoCount}.`
);
if (!WRITE) console.log('Ini dry-run. Tambahkan --write setelah hasilnya sesuai.');

await mongoose.disconnect();
