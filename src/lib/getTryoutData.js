// File: src/lib/getTryoutData.js
// Memuat soal terstruktur untuk satu paket. Mengembalikan null jika paket belum punya soal yang siap
// (belum dimigrasi atau semuanya needsReview), sehingga pemanggil bisa memakai CBT lama sebagai cadangan.
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';
import PaketSoal from '@/models/PaketSoal';
import Question from '@/models/Question';

export async function getTryoutData(topicSlug, packetSlug) {
  await dbConnect();

  const topic = await Topic.findOne({ slug: topicSlug }).select('title slug').lean();
  if (!topic) return null;

  const packet = await PaketSoal.findOne({ topic: topic._id, paket_slug: packetSlug })
    .select('title paket_slug paket_number')
    .lean();
  if (!packet) return null;

  const docs = await Question.find({ paket: packet._id }).sort({ number: 1 }).lean();
  const ready = docs.filter((q) => !q.needsReview);
  if (ready.length === 0) return null;

  return {
    topic: { title: topic.title, slug: topic.slug },
    packet: { title: packet.title, paket_slug: packet.paket_slug },
    skippedCount: docs.length - ready.length,
    questions: ready.map((q) => ({
      _id: q._id.toString(),
      number: q.number,
      type: q.type,
      supportHtml: q.supportHtml || '',
      stemHtml: q.stemHtml || '',
      options: (q.options || []).map((o) => ({ key: o.key, html: o.html })),
      statements: q.statements || [],
      answer: q.answer ?? '',
      acceptedAnswers: q.acceptedAnswers || [],
      explanationHtml: q.explanationHtml || '',
    })),
  };
}
