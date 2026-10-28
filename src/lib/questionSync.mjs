// File: src/lib/questionSync.mjs
// Logika murni (tanpa database) untuk menyinkronkan HTML paket ke soal terstruktur dan menyusun laporan.
import { analyzeHtml, hasIssues, hostMatches } from './contentAudit.mjs';
import { REMOTE_IMAGE_HOSTS } from './imageHosts.mjs';

// Operasi bulkWrite (upsert per paket + nomor). difficulty dan tags tidak ditimpa.
export function buildQuestionOps({ paketId, topicId, parsed }) {
  const ops = parsed.questions.map((q) => ({
    updateOne: {
      filter: { paket: paketId, number: q.number },
      update: {
        $set: {
          topic: topicId,
          type: q.type,
          supportHtml: parsed.supportHtml || '',
          stemHtml: q.stemHtml,
          options: q.options,
          statements: q.statements,
          answer: q.answer,
          acceptedAnswers: q.acceptedAnswers,
          explanationHtml: q.explanationHtml,
          needsReview: q.needsReview,
        },
        $setOnInsert: { tags: [] },
      },
      upsert: true,
    },
  }));
  return { ops, numbers: parsed.questions.map((q) => q.number) };
}

// Laporan untuk penulis: ringkasan soal, catatan yang perlu perhatian, dan masalah konten.
export function buildReport({ parsed, html }) {
  const count = (type) => parsed.questions.filter((q) => q.type === type).length;
  const lastNumber = parsed.questions.length ? parsed.questions[parsed.questions.length - 1].number : null;

  // Catatan ringan (teks pendukung bersama, teks penutup setelah soal terakhir) tidak ditampilkan
  const notes = parsed.warnings.filter((w) => {
    const isSupport = /teks pendukung/i.test(w);
    const isOutro = /ada konten setelah pembahasan/.test(w) && w.startsWith(`Nomor ${lastNumber}:`);
    return !isSupport && !isOutro;
  });

  const audit = analyzeHtml(html || '', {
    isHostAllowed: (host) => REMOTE_IMAGE_HOSTS.some((pattern) => hostMatches(host, pattern)),
    publicHas: () => true, // file di public/ tidak bisa diperiksa dari server; dianggap ada
  });

  const content = {
    entities: { ...audit.entities, ...audit.doubleEscaped },
    images: audit.images.filter((i) => i.problem).map((i) => ({ src: i.src, problem: i.problem })),
    oddDollar: audit.oddDollar,
    pWhere: audit.pWhere.map((w) => ({ number: w.number, open: w.open, close: w.close })),
  };

  return {
    questions: {
      total: parsed.questions.length,
      single: count('single'),
      complex: count('complex'),
      short: count('short'),
      essay: count('essay'),
      needsReview: parsed.questions.filter((q) => q.needsReview).length,
    },
    notes,
    content,
    ok: notes.length === 0 && !hasIssues(audit),
  };
}
