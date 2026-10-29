// File: scripts/seo-check.mjs
// Memeriksa SEO situs yang sedang berjalan: mengambil sitemap, membuka setiap halaman, dan melaporkan masalah
// (canonical salah, noindex, title/deskripsi bermasalah atau ganda, konten tipis, JSON-LD rusak, dll).
//
//   node scripts/seo-check.mjs https://www.minatmatematika.com > laporan-seo.txt
//   node scripts/seo-check.mjs http://localhost:3000 --limit=30       # server lokal; sitemap-nya tetap berisi alamat produksi
//
// Hanya membaca (permintaan GET). Opsi: --limit=N (jumlah halaman maksimum), --concurrency=N (default 4).
import { analyzeSeoPage, analyzeRobots, findDuplicates, parseSitemap } from '../src/lib/seoCheck.mjs';

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith('--')) || '').replace(/\/+$/, '');
const opt = (name, fallback) => Number((args.find((a) => a.startsWith(`--${name}=`)) || '').split('=')[1]) || fallback;
const LIMIT = opt('limit', 500);
const CONCURRENCY = opt('concurrency', 4);

if (!/^https?:\/\//.test(base)) {
  console.error('Pemakaian: node scripts/seo-check.mjs https://www.minatmatematika.com [--limit=50]');
  process.exit(1);
}

const UA = 'Mozilla/5.0 (compatible; MinatMatematika-SEO-Check)';
const get = (url) => fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) });

console.log(`Pemeriksaan SEO: ${base}\n`);

// 1. robots.txt
try {
  const res = await get(`${base}/robots.txt`);
  const text = await res.text();
  const robotsIssues = analyzeRobots(text, base);
  console.log(`robots.txt: status ${res.status}${robotsIssues.length ? '' : ', tidak ada masalah'}`);
  robotsIssues.forEach((i) => console.log(`  [${i.severity}] ${i.message}`));
} catch (error) {
  console.log(`robots.txt: gagal diambil (${error.message})`);
}

// 2. sitemap
let urls = [];
try {
  const res = await get(`${base}/sitemap.xml`);
  urls = parseSitemap(await res.text());
  console.log(`sitemap.xml: status ${res.status}, ${urls.length} alamat`);
} catch (error) {
  console.log(`sitemap.xml: gagal diambil (${error.message})`);
}
if (!urls.length) process.exit(0);

// Alamat sitemap berisi domain produksi; arahkan ke server yang diperiksa lewat path-nya
const targets = urls.slice(0, LIMIT).map((u) => {
  const p = new URL(u);
  return { sitemapUrl: u, fetchUrl: `${base}${p.pathname}${p.search}`, canonicalUrl: u };
});

// 3. periksa tiap halaman
const results = [];
let cursor = 0;
const worker = async () => {
  while (cursor < targets.length) {
    const t = targets[cursor++];
    try {
      const res = await get(t.fetchUrl);
      const html = res.status === 200 ? await res.text() : '';
      const r = analyzeSeoPage({
        url: t.canonicalUrl, // dibandingkan terhadap alamat produksi (host kanonik)
        status: res.status,
        html,
        redirected: res.redirected,
      });
      results.push(r);
    } catch (error) {
      results.push({ url: t.canonicalUrl, status: 0, issues: [{ severity: 'error', code: 'gagal', message: `gagal diambil: ${error.message}` }] });
    }
  }
};
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// 4. judul / deskripsi ganda
const dupTitles = findDuplicates(results, 'title');
const dupDescs = findDuplicates(results, 'description');

// 5. laporan
const byCode = new Map();
for (const r of results) for (const i of r.issues) byCode.set(i.code, [...(byCode.get(i.code) || []), { url: r.url, ...i }]);

const order = { error: 0, warn: 1, info: 2 };
console.log(`\nHalaman diperiksa: ${results.length}`);
const ok = results.filter((r) => !r.issues.some((i) => i.severity === 'error')).length;
console.log(`Tanpa masalah berat: ${ok} dari ${results.length}\n`);

const sorted = [...byCode.entries()].sort((a, b) => order[a[1][0].severity] - order[b[1][0].severity] || b[1].length - a[1].length);
for (const [code, items] of sorted) {
  console.log(`[${items[0].severity}] ${code}: ${items.length} halaman`);
  items.slice(0, 5).forEach((i) => console.log(`    ${i.url}\n      ${i.message}`));
  if (items.length > 5) console.log(`    ... dan ${items.length - 5} lainnya`);
}

if (dupTitles.length) {
  console.log(`\n[warn] title ganda: ${dupTitles.length} kelompok`);
  dupTitles.slice(0, 5).forEach((d) => console.log(`    "${d.value}" dipakai ${d.urls.length} halaman, mis. ${d.urls.slice(0, 2).join(', ')}`));
}
if (dupDescs.length) {
  console.log(`\n[warn] meta description ganda: ${dupDescs.length} kelompok`);
  dupDescs.slice(0, 5).forEach((d) => console.log(`    "${d.value.slice(0, 80)}..." dipakai ${d.urls.length} halaman`));
}
if (!sorted.length && !dupTitles.length && !dupDescs.length) console.log('Tidak ada masalah ditemukan pada halaman yang diperiksa.');
