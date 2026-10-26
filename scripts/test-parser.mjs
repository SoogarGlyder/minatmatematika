// Uji cepat parser terhadap helper.html:  node scripts/test-parser.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsePacketContent, normalizeShortAnswer } from '../src/lib/parsePacketContent.mjs';

const html = readFileSync(new URL('../helper.html', import.meta.url), 'utf8');
const { questions, warnings } = parsePacketContent(html);

console.log(`Soal terbaca: ${questions.length}, peringatan: ${warnings.length}`);
warnings.forEach((w) => console.log(' -', w));

const q1 = questions[0];
assert.equal(q1.number, 1);
assert.equal(q1.type, 'single');
assert.equal(q1.answer, 'D');
assert.deepEqual(q1.options.map((o) => o.key), ['A', 'B', 'C', 'D', 'E']);
assert.match(q1.options[3].html, /bukan tumbuhan palem/);
assert.ok(!q1.stemHtml.includes('A. '), 'opsi harus keluar dari stemHtml');
assert.ok(!/Jawaban:/.test(q1.explanationHtml), 'baris Jawaban dipindah ke field answer');
assert.match(q1.explanationHtml, /Kesimpulan/);

// soal kompleks buatan (tabel pernyataan)
const complexHtml = `<h3>Nomor 1</h3><p>Tentukan.</p><table><thead><tr><th>Pernyataan</th></tr></thead><tbody>
<tr><td>2 + 2 = 4</td><td>Benar</td></tr><tr><td>3 &gt; 5</td><td>Salah</td></tr></tbody></table>
<details><summary>Lihat Pembahasan</summary><div><p>Pernyataan 1: <strong>BENAR</strong></p><p>Pernyataan 2: <strong>SALAH</strong></p></div></details>`;
const c = parsePacketContent(complexHtml).questions[0];
assert.equal(c.type, 'complex');
assert.deepEqual(c.answer, ['BENAR', 'SALAH']);
assert.equal(c.statements.length, 2);

// soal isian singkat (contoh nyata dari paket taman-kota)
const shortHtml = `<h3>Nomor 3</h3><p>Jarak terpendek adalah ... m. (Jawab dengan bilangan cacah)</p>
<details><summary>Lihat Pembahasan</summary><div><p><strong>Jawaban: 270 m</strong></p><p>Total lintasan = $150 + 120 = 270 m$</p></div></details>`;
const s = parsePacketContent(shortHtml);
assert.equal(s.questions[0].type, 'short');
assert.equal(s.questions[0].answer, '270 m');
assert.deepEqual(s.questions[0].acceptedAnswers, ['270']);
assert.ok(!/Jawaban:/.test(s.questions[0].explanationHtml));
assert.equal(s.warnings.length, 0);

assert.equal(normalizeShortAnswer('12,5 cm'), '12.5');
assert.equal(normalizeShortAnswer('1.000'), '1000');
assert.equal(normalizeShortAnswer('3/4'), '3/4');
assert.equal(normalizeShortAnswer('2 dan 5'), null);
assert.equal(normalizeShortAnswer('tidak ada'), null);

// kunci dari kalimat penutup pembahasan (format paket fungsi-persamaan / baris-deret)
const sentenceHtml = `<h3>Nomor 1</h3><p>Nilai $(g \\circ f)(2) = \\dots$<br />
<p>A. 8<br />B. 6<br />C. 4<br />D. 2<br />E. 0</p>
<details><summary>Lihat Pembahasan</summary><div><p>Hitung dulu $f(2)=1$, lalu $g(1)=2$.</p><p><strong>Jadi jawabannya adalah D. 2</strong></p></div></details>`;
const sq = parsePacketContent(sentenceHtml).questions[0];
assert.equal(sq.type, 'single');
assert.equal(sq.answer, 'D');
assert.equal(sq.options.length, 5);
assert.equal(parsePacketContent(sentenceHtml).warnings.length, 0);

// soal uraian: tanpa kunci dan tanpa opsi, hanya pembahasan -> essay, tanpa peringatan
const essayHtml = `<h3>Nomor 1</h3><p>$3^4 = \\dots$</p>
<details><summary>Lihat Pembahasan</summary><div><p style="text-align: left;">$3^4 = 81$</p></div></details>`;
const eq = parsePacketContent(essayHtml);
assert.equal(eq.questions[0].type, 'essay');
assert.equal(eq.questions[0].answer, '');
assert.equal(eq.warnings.length, 0);

// sub-soal a, b, c: beberapa <details> disimpan utuh; "a." huruf kecil bukan opsi
const multiHtml = `<h3>Nomor 7</h3><p>Gunakan kalkulator.<br />a. $\\sqrt{6}$<br />b. $\\sqrt{10}$</p>
<details><summary>Lihat Pembahasan (a)</summary><div><p>$\\sqrt{6} = 2,44949$</p></div></details>
<details style="margin-top: 10px;"><summary>Lihat Pembahasan (b)</summary><div><p>$\\sqrt{10} = 3,16228$</p></div></details>`;
const mq = parsePacketContent(multiHtml).questions[0];
assert.equal(mq.type, 'essay');
assert.equal(mq.options.length, 0);
assert.equal((mq.explanationHtml.match(/<details/g) || []).length, 2);
assert.equal((mq.explanationHtml.match(/<\/details>/g) || []).length, 2);

// ada opsi tetapi kunci tidak ditemukan -> tetap diperingatkan (data perlu diperbaiki manual)
const brokenHtml = `<h3>Nomor 20</h3><p>Susunan tim yang benar adalah...</p><p>A. A, D, G<br />B. A, B, G<br />C. A, I, F<br />D. A, D, I</p>
<details><summary>Lihat Pembahasan</summary><div><p>Tidak ada opsi yang sesuai.</p></div></details>`;
const bq = parsePacketContent(brokenHtml);
assert.equal(bq.questions[0].type, 'single');
assert.equal(bq.questions[0].answer, '');
assert.equal(bq.questions[0].options.length, 4);
assert.ok(bq.warnings.some((w) => /kunci jawaban tidak ditemukan/.test(w)));
assert.equal(bq.questions[0].needsReview, true);
assert.equal(eq.questions[0].needsReview, false);
assert.equal(sq.needsReview, false);

// variasi kalimat kunci dari paket bentuk-akar
const variantHtml = (conclusion) => `<h3>Nomor 1</h3><p>$\\sqrt{8} = \\dots$</p><p>A. $\\sqrt{2}$<br />B. $2\\sqrt{2}$<br />C. $4$<br />D. $8$<br />E. $16$</p>
<details><summary>Lihat Pembahasan</summary><div><p>Penjabaran...</p>${conclusion}</div></details>`;
assert.equal(parsePacketContent(variantHtml('<p><strong>Jadi jawaban untuk soal ini adalah B. $2\\sqrt{2}$</strong></p>')).questions[0].answer, 'B');
assert.equal(parsePacketContent(variantHtml('<p>Jadi, yang <strong>bukan</strong> bilangan rasional adalah <strong>C. $\\sqrt{2}$</strong>.</p>')).questions[0].answer, 'C');

// kalimat bersyarat / catatan soal cacat TIDAK boleh dianggap kunci
for (const c of [
  '<p><strong>Jadi jawabannya (dengan asumsi pertanyaan $S_{15}$) adalah A. 660</strong></p>',
  '<p><em>(Catatan: Hasil yang benar secara matematis adalah 70; kemungkinan typo, opsi A).</em></p>',
]) {
  const r = parsePacketContent(variantHtml(c));
  assert.equal(r.questions[0].answer, '');
  assert.equal(r.questions[0].needsReview, true);
}

console.log('Semua pengujian lulus.');
