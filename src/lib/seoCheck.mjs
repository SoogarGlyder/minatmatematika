// File: src/lib/seoCheck.mjs
// Pemeriksa SEO satu halaman dari HTML-nya (fungsi murni; dipakai scripts/seo-check.mjs dan diuji di test-seo.mjs).

const entity = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return m ? entity(m[1] ?? m[2]) : null;
};

function metaTags(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
}

export function metaContent(html, key) {
  for (const tag of metaTags(html)) {
    const name = (attr(tag, 'name') || attr(tag, 'property') || '').toLowerCase();
    if (name === key.toLowerCase()) return attr(tag, 'content');
  }
  return null;
}

export function canonicalOf(html) {
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    if ((attr(m[0], 'rel') || '').toLowerCase().split(/\s+/).includes('canonical')) return attr(m[0], 'href');
  }
  return null;
}

export function visibleWordCount(html) {
  const text = html
    .replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ');
  return (text.match(/[\p{L}\p{N}]{2,}/gu) || []).length;
}

const normPath = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

// url: alamat halaman yang diperiksa; expectedHost: host kanonik situs; status: kode HTTP; redirected: true bila ada pengalihan
export function analyzeSeoPage({ url, status, html, expectedHost = 'www.minatmatematika.com', redirected = false }) {
  const issues = [];
  const add = (severity, code, message) => issues.push({ severity, code, message });
  const page = new URL(url);
  const result = { url, status, title: null, description: null, canonical: null, robots: null, h1: 0, words: 0, jsonLd: 0, issues };

  if (status !== 200) {
    add('error', 'status', `status HTTP ${status} (harus 200 agar bisa diindeks)`);
    return result;
  }
  if (redirected) add('warn', 'redirect', 'alamat di sitemap berakhir di pengalihan; sitemap sebaiknya berisi alamat akhir');

  // title & description
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  result.title = title ? entity(title).replace(/\s+/g, ' ').trim() : null;
  result.description = metaContent(html, 'description');
  if (!result.title) add('error', 'title-kosong', 'tidak ada <title>');
  else if (result.title.length < 15) add('warn', 'title-pendek', `title terlalu pendek (${result.title.length} karakter)`);
  else if (result.title.length > 70) add('warn', 'title-panjang', `title ${result.title.length} karakter (akan terpotong di hasil pencarian, ideal ≤ 60-65)`);
  if (!result.description) add('warn', 'deskripsi-kosong', 'tidak ada meta description');
  else if (result.description.length < 70) add('warn', 'deskripsi-pendek', `meta description pendek (${result.description.length} karakter)`);
  else if (result.description.length > 170) add('warn', 'deskripsi-panjang', `meta description ${result.description.length} karakter (akan terpotong)`);

  // canonical
  result.canonical = canonicalOf(html);
  if (!result.canonical) add('warn', 'canonical-kosong', 'tidak ada link canonical');
  else {
    let c;
    try { c = new URL(result.canonical, url); } catch { c = null; }
    if (!c) add('error', 'canonical-rusak', `canonical tidak valid: ${result.canonical}`);
    else {
      if (c.host !== expectedHost) add('error', 'canonical-host', `canonical memakai host ${c.host} (seharusnya ${expectedHost})`);
      if (normPath(c.pathname) !== normPath(page.pathname)) add('error', 'canonical-salah', `canonical menunjuk ke ${c.pathname}, bukan halaman ini (${page.pathname}); Google bisa menganggap halaman ini duplikat`);
    }
  }

  // robots meta
  result.robots = metaContent(html, 'robots');
  if (result.robots && /noindex/i.test(result.robots)) add('error', 'noindex', `meta robots berisi noindex ("${result.robots}")`);

  // heading
  result.h1 = (html.match(/<h1\b/gi) || []).length;
  if (result.h1 === 0) add('warn', 'h1-kosong', 'tidak ada <h1>');
  else if (result.h1 > 1) add('warn', 'h1-ganda', `${result.h1} elemen <h1> (sebaiknya satu)`);

  // isi
  result.words = visibleWordCount(html);
  if (result.words < 120) add('warn', 'konten-tipis', `isi teks terlihat hanya ${result.words} kata (halaman tipis sulit diindeks)`);

  // data terstruktur
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    result.jsonLd++;
    try { JSON.parse(m[1]); } catch { add('error', 'jsonld-rusak', 'blok JSON-LD tidak valid (bukan JSON yang benar)'); }
  }

  // gambar tanpa alt
  const noAlt = [...html.matchAll(/<img\b[^>]*>/gi)].filter((m) => !/\salt\s*=\s*"[^"]+"/i.test(m[0]) && !/\salt\s*=\s*'[^']+'/i.test(m[0])).length;
  if (noAlt) add('warn', 'gambar-tanpa-alt', `${noAlt} gambar tanpa teks alt`);

  // media sosial
  if (!metaContent(html, 'og:title')) add('info', 'og-title', 'tidak ada og:title');
  if (!metaContent(html, 'og:image')) add('info', 'og-image', 'tidak ada og:image');

  return result;
}

// Pemeriksaan robots.txt
export function analyzeRobots(text, base) {
  const issues = [];
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim());
  const disallow = lines.filter((l) => /^disallow:/i.test(l)).map((l) => l.replace(/^disallow:\s*/i, ''));
  if (disallow.some((d) => d === '/_next/' || d === '/_next')) issues.push({ severity: 'error', code: 'robots-next', message: 'robots.txt memblokir /_next/ (Google butuh CSS/JS dan gambar teroptimasi untuk merender halaman)' });
  if (disallow.includes('/')) issues.push({ severity: 'error', code: 'robots-semua', message: 'robots.txt memblokir seluruh situs (Disallow: /)' });
  if (!lines.some((l) => /^sitemap:/i.test(l))) issues.push({ severity: 'warn', code: 'robots-sitemap', message: `robots.txt tidak menyebut Sitemap (seharusnya ${base}/sitemap.xml)` });
  return issues;
}

// Mencari judul/deskripsi ganda di antara hasil beberapa halaman
export function findDuplicates(results, field) {
  const groups = new Map();
  for (const r of results) {
    const v = r[field];
    if (!v) continue;
    groups.set(v, [...(groups.get(v) || []), r.url]);
  }
  return [...groups.entries()].filter(([, urls]) => urls.length > 1).map(([value, urls]) => ({ value, urls }));
}

export function parseSitemap(xml) {
  return [...String(xml || '').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => entity(m[1]));
}
