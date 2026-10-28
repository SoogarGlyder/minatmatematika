// Uji kerangka soal terhadap parser:  node scripts/test-templates.mjs
import assert from 'node:assert/strict';
import { TEMPLATES, insertTemplate, nextNumber } from '../src/lib/soalTemplates.mjs';
import { parsePacketContent } from '../src/lib/parsePacketContent.mjs';
import { buildReport } from '../src/lib/questionSync.mjs';

const parseOne = (id) => {
  const { content } = insertTemplate('', undefined, undefined, id);
  return { content, parsed: parsePacketContent(content) };
};

// 1. tiap kerangka terbaca benar oleh parser, tanpa peringatan dan tanpa needsReview
{
  const expect = {
    'pilihan-ganda': (q) => { assert.equal(q.type, 'single'); assert.equal(q.answer, 'A'); assert.equal(q.options.length, 5); },
    'kompleks-ya-tidak': (q) => { assert.equal(q.type, 'complex'); assert.deepEqual(q.answer, ['YA', 'TIDAK', 'YA']); assert.equal(q.statements.length, 3); },
    'kompleks-benar-salah': (q) => { assert.equal(q.type, 'complex'); assert.deepEqual(q.answer, ['BENAR', 'SALAH', 'BENAR']); assert.equal(q.statements.length, 3); },
    'isian-singkat': (q) => { assert.equal(q.type, 'short'); assert.equal(q.answer, '270'); assert.deepEqual(q.acceptedAnswers, ['270']); },
    'uraian': (q) => { assert.equal(q.type, 'essay'); assert.equal(q.answer, ''); },
    'uraian-bertahap': (q) => { assert.equal(q.type, 'essay'); assert.equal((q.explanationHtml.match(/<details/g) || []).length, 2); assert.equal(q.options.length, 0); },
  };
  for (const [id, check] of Object.entries(expect)) {
    const { parsed } = parseOne(id);
    assert.equal(parsed.questions.length, 1, `${id}: harus tepat satu soal`);
    const q = parsed.questions[0];
    assert.equal(q.number, 1, `${id}: nomor otomatis 1`);
    assert.equal(q.needsReview, false, `${id}: tidak boleh needsReview`);
    assert.deepEqual(parsed.warnings.filter((w) => !/teks pendukung/i.test(w)), [], `${id}: tanpa peringatan`);
    check(q);
  }
}

// 2. teks pendukung disisipkan di awal dan dibaca sebagai supportHtml
{
  const first = insertTemplate('', undefined, undefined, 'pilihan-ganda').content;
  const r = insertTemplate(first, 0, 0, 'teks-pendukung');
  assert.ok(r.content.startsWith('<h3>Teks Pendukung</h3>'));
  const parsed = parsePacketContent(r.content);
  assert.match(parsed.supportHtml, /Teks Pendukung/);
  assert.equal(parsed.questions.length, 1);
  assert.equal(parsed.questions[0].needsReview, false);
}

// 3. penomoran otomatis berurutan dan satu paket campuran terbaca bersih
{
  let content = '';
  for (const id of ['pilihan-ganda', 'kompleks-ya-tidak', 'isian-singkat', 'uraian', 'pilihan-ganda']) {
    content = insertTemplate(content, content.length, content.length, id).content;
  }
  assert.equal(nextNumber(content), 6);
  const parsed = parsePacketContent(content);
  assert.deepEqual(parsed.questions.map((q) => q.number), [1, 2, 3, 4, 5]);
  assert.deepEqual(parsed.questions.map((q) => q.type), ['single', 'complex', 'short', 'essay', 'single']);
  assert.equal(parsed.questions.every((q) => !q.needsReview), true);
  const report = buildReport({ parsed, html: content });
  assert.equal(report.ok, true, JSON.stringify(report.notes) + JSON.stringify(report.content));
}

// 4. penyisipan di tengah memakai posisi kursor dan menjaga jarak antar blok
{
  const a = insertTemplate('', undefined, undefined, 'uraian').content;
  const b = insertTemplate(a, a.length, a.length, 'uraian').content;
  const mid = b.indexOf('<h3>Nomor 2</h3>');
  const r = insertTemplate(b, mid, mid, 'pilihan-ganda');
  assert.equal(r.content.includes('<h3>Nomor 3</h3>'), true); // nomor = terbesar + 1
  assert.equal(r.content.slice(r.selectStart, r.selectEnd), 'Tulis pertanyaan di sini.');
  assert.ok(!/\n{4,}/.test(r.content), 'tidak boleh ada terlalu banyak baris kosong');
}

// 5. teks pengisi terpilih benar untuk setiap kerangka
for (const t of TEMPLATES) {
  const r = insertTemplate('', undefined, undefined, t.id);
  assert.equal(r.content.slice(r.selectStart, r.selectEnd), t.select, `${t.id}: rentang pilihan`);
}

// 6. gambar: sisipan di kursor, bukan soal
{
  const r = insertTemplate('<p>awal</p>', 11, 11, 'gambar');
  assert.ok(r.content.startsWith('<p>awal</p>\n\n<p><img src="https://i.postimg.cc/'));
  assert.equal(parsePacketContent(r.content).questions.length, 0);
}

console.log('Semua pengujian kerangka soal lulus.');
