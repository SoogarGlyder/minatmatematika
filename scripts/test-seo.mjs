// Uji pemeriksa SEO dan teks SEO:  node scripts/test-seo.mjs
import assert from 'node:assert/strict';
import { analyzeSeoPage, analyzeRobots, findDuplicates, parseSitemap, canonicalOf, metaContent } from '../src/lib/seoCheck.mjs';
import { buildPacketSeo, buildTopicSeo, plainText, truncate } from '../src/lib/seoText.mjs';

const words = Array.from({ length: 200 }, (_, i) => `kata${i}`).join(' ');
const page = ({ title = 'Soal dan Pembahasan Bayangan Lampu Paket 01 | Minat Matematika', desc = 'Latihan Bayangan Lampu Paket 01: 4 soal beserta pembahasan lengkap untuk persiapan UTBK SNBT.', canonical = 'https://www.minatmatematika.com/bayangan-lampu/paket-01', robots, h1 = '<h1>Bayangan Lampu</h1>', ld = '{"@context":"https://schema.org","@type":"BreadcrumbList"}', body = `<p>${words}</p>` } = {}) => `<!DOCTYPE html><html lang="id"><head>
<title>${title}</title><meta name="description" content="${desc}"/>${canonical ? `<link rel="canonical" href="${canonical}"/>` : ''}
${robots ? `<meta name="robots" content="${robots}"/>` : ''}<meta property="og:title" content="x"/><meta property="og:image" content="/a.jpg"/>
<script type="application/ld+json">${ld}</script></head><body>${h1}${body}</body></html>`;

const URL1 = 'https://www.minatmatematika.com/bayangan-lampu/paket-01';
const codes = (r) => r.issues.map((i) => i.code);

// halaman sehat
assert.deepEqual(analyzeSeoPage({ url: URL1, status: 200, html: page() }).issues, []);

// canonical bocor ke beranda (kasus halaman /about yang mewarisi canonical '/')
{
  const r = analyzeSeoPage({ url: 'https://www.minatmatematika.com/about', status: 200, html: page({ canonical: 'https://www.minatmatematika.com/' }) });
  assert.ok(codes(r).includes('canonical-salah'));
}
// canonical relatif yang benar diterima; host salah ditolak
assert.deepEqual(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ canonical: '/bayangan-lampu/paket-01' }) })).filter((c) => c.startsWith('canonical')), []); // relatif diselesaikan terhadap halaman
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ canonical: 'https://minatmatematika.com/bayangan-lampu/paket-01' }) })).includes('canonical-host'));
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ canonical: null }) })).includes('canonical-kosong'));
// noindex, status, JSON-LD rusak, h1, konten tipis, title/deskripsi
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ robots: 'noindex, nofollow' }) })).includes('noindex'));
assert.deepEqual(codes(analyzeSeoPage({ url: URL1, status: 404, html: '' })), ['status']);
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ ld: '{rusak' }) })).includes('jsonld-rusak'));
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ h1: '<h1>a</h1><h1>b</h1>' }) })).includes('h1-ganda'));
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ body: '<p>sedikit</p>' }) })).includes('konten-tipis'));
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ title: 'x'.repeat(90) }) })).includes('title-panjang'));
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ desc: 'pendek' }) })).includes('deskripsi-pendek'));
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page({ body: `<p>${words}</p><img src="/a.png">` }) })).includes('gambar-tanpa-alt'));
assert.ok(codes(analyzeSeoPage({ url: URL1, status: 200, html: page(), redirected: true })).includes('redirect'));

// meta tag dengan urutan atribut berbeda
assert.equal(metaContent('<meta content="halo" name="description">', 'description'), 'halo');
assert.equal(canonicalOf('<link href="/x" rel="canonical">'), '/x');

// robots.txt
assert.deepEqual(analyzeRobots('User-agent: *\nDisallow: /api/\nSitemap: https://x/sitemap.xml', 'https://x'), []);
assert.deepEqual(analyzeRobots('User-agent: *\nDisallow: /_next/\n', 'https://x').map((i) => i.code), ['robots-next', 'robots-sitemap']);
assert.ok(analyzeRobots('User-agent: *\nDisallow: /\nSitemap: https://x/s.xml', 'https://x').some((i) => i.code === 'robots-semua'));

// duplikat dan sitemap
assert.equal(findDuplicates([{ url: 'a', title: 'T' }, { url: 'b', title: 'T' }, { url: 'c', title: 'U' }], 'title').length, 1);
assert.deepEqual(parseSitemap('<urlset><url><loc>https://x/a</loc></url><url><loc> https://x/b?c=1&amp;d=2 </loc></url></urlset>'), ['https://x/a', 'https://x/b?c=1&d=2']);

// ---- teks SEO ----
assert.equal(plainText('<p>Hitung $x^2$ lalu &hellip; selesai&nbsp;ya</p>'), 'Hitung lalu … selesai ya');
assert.ok(truncate('a'.repeat(200), 50).length <= 50);
assert.equal(truncate('pendek', 50), 'pendek');

const content = `<h3>Nomor 1</h3><p>Pada dinding suatu ruangan dipasang lampu dengan ketinggian 4 m dari lantai ruangan. Tinggi meja adalah... m.</p>
<p>A. 1<br />B. 1,4<br />C. 1,5<br />D. 1,6<br />E. 1,8</p><details><summary>x</summary><div><p><strong>Jawaban: C</strong></p></div></details>
<h3>Nomor 2</h3><p>Soal kedua.</p><p>A. 1<br />B. 2</p><details><summary>x</summary><div><p><strong>Jawaban: A</strong></p></div></details>`;
const seo = buildPacketSeo({ topicTitle: 'Bayangan Lampu', packetTitle: 'Paket 01', content });
assert.equal(seo.title, 'Soal dan Pembahasan Bayangan Lampu Paket 01 | Minat Matematika');
assert.equal(seo.total, 2);
assert.match(seo.description, /^Latihan Bayangan Lampu Paket 01: 2 soal beserta pembahasan lengkap/);
assert.match(seo.description, /Contoh soal: "Pada dinding/);
assert.ok(seo.description.length <= 160, `deskripsi ${seo.description.length} karakter`);
assert.ok(!/<|\$/.test(seo.description));
// judul panjang diringkas; paket tanpa soal tetap punya deskripsi yang wajar
assert.ok(buildPacketSeo({ topicTitle: 'Penalaran Kuantitatif dan Statistika Dasar', packetTitle: 'Paket 10', content }).title.length <= 68);
assert.match(buildPacketSeo({ topicTitle: 'X', packetTitle: 'Y', content: '<p>teks saja</p>' }).description, /^Latihan X Y beserta pembahasan/);
// deskripsi topik: pendek diperpanjang, panjang dipotong
assert.ok(buildTopicSeo({ title: 'Matriks', description: 'Operasi matriks.', paketCount: 3 }).description.includes('Tersedia 3 paket'));
assert.match(buildTopicSeo({ title: 'Matriks', description: '', paketCount: 0 }).description, /^Belajar materi Matriks/);
assert.ok(buildTopicSeo({ title: 'M', description: 'x '.repeat(200), paketCount: 1 }).description.length <= 160);
assert.equal(buildTopicSeo({ title: 'Matriks', description: '', paketCount: 1 }).title, 'Matriks: Materi, Latihan Soal & Pembahasan | Minat Matematika');

console.log('Semua pengujian SEO lulus.');
