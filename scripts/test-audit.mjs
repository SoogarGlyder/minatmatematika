// Uji fungsi audit:  node scripts/test-audit.mjs
import assert from 'node:assert/strict';
import { analyzeHtml, classifyImage, hostMatches, planImageTargets } from './audit-lib.mjs';

const env = {
  isHostAllowed: (h) => ['i.postimg.cc', 'i.imgur.com', 'minatmatematika.com'].includes(h),
  publicHas: (p) => p === '/saweria.png',
};

// entitas tidak valid
let r = analyzeHtml('<p>Jarak adalah &dots; m dan 5 &times; 3 &amp; &hellip;</p>', env);
assert.deepEqual(r.entities, { '&dots;': 1 });

// gambar
assert.equal(classifyImage('https://i.postimg.cc/abc/x.png', env), null);
assert.equal(classifyImage('/saweria.png', env), null);
assert.match(classifyImage('/tidak-ada.png', env), /folder public/);
assert.match(classifyImage('https://postimg.cc/abc123', env), /tautan halaman Postimg/);
assert.match(classifyImage('https://i.ibb.co/x.png', env), /belum ada di remotePatterns/);
assert.match(classifyImage('http://i.imgur.com/x.png', env), /http:\/\//);
assert.match(classifyImage('', env), /kosong/);
r = analyzeHtml('<p><img src="https://i.ibb.co/x.png" alt="a"></p><img alt="tanpa src">', env);
assert.equal(r.images.length, 2);
assert.ok(r.images[0].problem && r.images[1].problem);

// $ ganjil dan <p> tidak seimbang
r = analyzeHtml('<p>Nilai $x^2 + 1 adalah...</p><p>Benar $y$ dan $z$</p>', env);
assert.equal(r.oddDollar.length, 1);
r = analyzeHtml('<p>Diketahui $f(x)$<br />\n<p>A. 8<br />B. 6</p>', env);
assert.deepEqual(r.pMismatch, { open: 2, close: 1 });

// konten bersih
r = analyzeHtml('<p>Hitung $2+2$ lalu &hellip;</p><p><img src="/saweria.png"></p>', env);
assert.deepEqual(r.entities, {});
assert.equal(r.oddDollar.length, 0);
assert.equal(r.pMismatch, null);

assert.equal(hostMatches('cdn.x.com', '*.x.com'), true);
assert.equal(hostMatches('a.b.x.com', '*.x.com'), false);
assert.equal(hostMatches('a.b.x.com', '**.x.com'), true);
assert.equal(hostMatches('i.imgur.com', 'i.imgur.com'), true);

// &approx; adalah entitas valid (sebelumnya salah dilaporkan)
assert.deepEqual(analyzeHtml('<p>x &approx; 3 dan &ne; 4</p>', env).entities, {});
// entitas tersimpan ganda
r = analyzeHtml('<p>Jarak adalah &amp;dots; m, 5 &amp;times; 3, dan a &amp;= b</p>', env);
assert.deepEqual(r.doubleEscaped, { '&amp;dots;': 1, '&amp;times;': 1 });
// lokasi <p> tidak seimbang per nomor
r = analyzeHtml('<h3>Nomor 1</h3><p>a<br />\n<p>A. 8</p><h3>Nomor 2</h3><p>ok</p>', env);
assert.deepEqual(r.pWhere.map((w) => [w.number, w.open, w.close]), [[1, 2, 1]]);
// rencana pemindahan gambar
const plan = planImageTargets([
  'https://minatmatematika.com/wp-content/uploads/2025/04/pm-a-768x385.png',
  'https://i.postimg.cc/abc/kuantitatif-01.png',
  'https://other.example/x/kuantitatif-01.png',
]);
assert.equal(plan.get('https://minatmatematika.com/wp-content/uploads/2025/04/pm-a-768x385.png'), '/images/soal/pm-a-768x385.png');
assert.equal(plan.get('https://i.postimg.cc/abc/kuantitatif-01.png'), '/images/soal/kuantitatif-01.png');
assert.match(plan.get('https://other.example/x/kuantitatif-01.png'), /^\/images\/soal\/\d+-kuantitatif-01\.png$/);

console.log('Semua pengujian audit lulus.');
