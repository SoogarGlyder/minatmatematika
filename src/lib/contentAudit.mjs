// File: src/lib/contentAudit.mjs
// Fungsi murni untuk memeriksa kualitas HTML konten (dipakai skrip audit dan pemeriksaan saat simpan paket).

// Entitas HTML yang umum dipakai di konten matematika. Selain ini dilaporkan sebagai "perlu dicek".
const KNOWN_ENTITIES = new Set([
  'amp', 'lt', 'gt', 'quot', 'apos', 'nbsp', 'hellip', 'ndash', 'mdash', 'lsquo', 'rsquo', 'ldquo', 'rdquo',
  'times', 'divide', 'plusmn', 'deg', 'middot', 'laquo', 'raquo', 'copy', 'reg', 'trade', 'euro', 'cent',
  'pound', 'yen', 'sect', 'para', 'bull', 'larr', 'rarr', 'uarr', 'darr', 'harr', 'infin', 'ne', 'le', 'ge',
  'asymp', 'sum', 'prod', 'radic', 'minus', 'frac12', 'frac14', 'frac34', 'sup2', 'sup3', 'micro', 'alpha',
  'beta', 'gamma', 'delta', 'theta', 'lambda', 'mu', 'pi', 'sigma', 'omega', 'Delta', 'Omega', 'Sigma',
  'there4', 'because', 'forall', 'exist', 'isin', 'cap', 'cup', 'sub', 'sup', 'and', 'or', 'not', 'ensp', 'emsp', 'thinsp',
  'approx', 'equiv', 'sim', 'simeq', 'cong', 'propto', 'prop', 'angle', 'ang', 'perp', 'parallel', 'prime', 'Prime',
  'empty', 'nabla', 'part', 'int', 'll', 'gg', 'sube', 'supe', 'nsub', 'notin', 'ni', 'oplus', 'otimes',
  'lceil', 'rceil', 'lfloor', 'rfloor', 'lArr', 'rArr', 'hArr', 'uArr', 'dArr', 'lang', 'rang', 'sdot', 'rho', 'tau',
  'zeta', 'eta', 'kappa', 'xi', 'nu', 'psi', 'chi', 'iota', 'phi', 'Phi', 'epsilon', 'Gamma', 'Lambda', 'Pi', 'Theta', 'Psi',
]);

// Entitas yang sering terketik di editor lalu tersimpan "ganda" (&amp;dots; tampil mentah sebagai teks "&dots;").
// Dipakai untuk mendeteksi dan memperbaiki; "dots" dipetakan ke &hellip;.
export const DOUBLE_ESCAPED = [
  'dots', 'hellip', 'nbsp', 'approx', 'times', 'divide', 'plusmn', 'deg', 'le', 'ge', 'ne', 'minus', 'ndash', 'mdash',
  'middot', 'radic', 'infin', 'sup2', 'sup3', 'frac12', 'frac14', 'frac34', 'ldquo', 'rdquo', 'lsquo', 'rsquo',
];

export function stripTags(s) {
  return s.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}

export function classifyImage(src, { isHostAllowed, publicHas }) {
  const value = (src || '').trim();
  if (!value) return 'src gambar kosong';
  if (value.startsWith('data:')) return null;
  if (value.startsWith('/') && !value.startsWith('//')) {
    return publicHas(value.split('?')[0]) ? null : 'file tidak ada di folder public';
  }
  let url;
  try {
    url = new URL(value.startsWith('//') ? `https:${value}` : value);
  } catch {
    return 'alamat gambar tidak valid atau masih berupa penanda yang belum diisi (isi dengan tautan gambar yang benar)';
  }
  if (url.protocol === 'http:') return 'memakai http:// (diblokir next/image; ganti ke https://)';
  if (url.protocol !== 'https:') return `protokol tidak didukung (${url.protocol})`;
  const host = url.hostname.toLowerCase();
  if (host === 'postimg.cc' || host === 'www.postimg.cc') return 'tautan halaman Postimg, bukan tautan gambar langsung (i.postimg.cc)';
  if (host === 'imgur.com' || host === 'www.imgur.com') return 'tautan halaman Imgur, bukan tautan gambar langsung (i.imgur.com)';
  if (!isHostAllowed(host)) return `host "${host}" belum ada di remotePatterns next.config.mjs`;
  return null;
}

export function analyzeHtml(html, env) {
  const result = { entities: {}, doubleEscaped: {}, images: [], oddDollar: [], pMismatch: null, pWhere: [] };
  if (!html || typeof html !== 'string') return result;

  // 1. Entitas bernama yang tidak dikenali (mis. &dots; yang tidak valid di HTML)
  for (const m of html.matchAll(/&([a-zA-Z][a-zA-Z0-9]*);/g)) {
    if (!KNOWN_ENTITIES.has(m[1])) result.entities[m[0]] = (result.entities[m[0]] || 0) + 1;
  }

  // 1b. Entitas yang tersimpan ganda, mis. "&amp;dots;" (tampil sebagai teks "&dots;")
  for (const m of html.matchAll(/&amp;([a-zA-Z][a-zA-Z0-9]*);/g)) {
    if (DOUBLE_ESCAPED.includes(m[1])) result.doubleEscaped[m[0]] = (result.doubleEscaped[m[0]] || 0) + 1;
  }

  // 2. Gambar
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = (m[0].match(/\bsrc\s*=\s*["']([^"']*)["']/i) || [])[1];
    result.images.push({ src: src || '', problem: classifyImage(src, env) });
  }

  // 3. Tanda $ ganjil di satu paragraf/baris (rumus LaTeX kemungkinan tidak tertutup)
  for (const chunk of html.split(/<\/p>|<br\s*\/?>|<\/li>|<\/h[1-6]>/i)) {
    const text = stripTags(chunk).replace(/\\\$/g, '');
    const count = (text.match(/\$/g) || []).length;
    if (count % 2 === 1) result.oddDollar.push(text.slice(0, 70));
  }

  // 4. <p> yang tidak tertutup / berlebih
  const open = (html.match(/<p[\s>]/gi) || []).length;
  const close = (html.match(/<\/p>/gi) || []).length;
  if (open !== close) result.pMismatch = { open, close };

  // Lokasi: per soal (dipisah oleh <h3>Nomor N</h3>)
  if (open !== close || /<p[\s>]/i.test(html)) {
    for (const chunk of html.split(/(?=<h3[^>]*>\s*Nomor\s+\d+\s*<\/h3>)/i)) {
      const head = chunk.match(/^<h3[^>]*>\s*Nomor\s+(\d+)\s*<\/h3>/i);
      const o = (chunk.match(/<p[\s>]/gi) || []).length;
      const c = (chunk.match(/<\/p>/gi) || []).length;
      if (o !== c) result.pWhere.push({ number: head ? Number(head[1]) : null, open: o, close: c, snippet: stripTags(chunk).slice(0, 60) });
    }
  }

  return result;
}

export function hasIssues(r) {
  return (
    Object.keys(r.entities).length > 0 ||
    Object.keys(r.doubleEscaped).length > 0 ||
    r.images.some((i) => i.problem) ||
    r.oddDollar.length > 0 ||
    r.pMismatch !== null
  );
}

export function hostMatches(host, pattern) {
  if (!pattern) return false;
  if (pattern.startsWith('**.')) return host === pattern.slice(3) || host.endsWith(pattern.slice(2));
  if (pattern.startsWith('*.')) return host.endsWith(pattern.slice(1)) && host.split('.').length === pattern.split('.').length;
  return host === pattern;
}

// Rencana pemindahan gambar: URL -> alamat lokal /images/soal/<nama-file>. Nama file yang bentrok diberi awalan.
export function planImageTargets(urls, hash = (u) => String(Math.abs([...u].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7))).slice(0, 6)) {
  const used = new Map(); // nama file -> url pertama yang memakainya
  const plan = new Map();
  for (const url of urls) {
    let name;
    try {
      name = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
    } catch {
      continue;
    }
    if (!name) continue;
    if (used.has(name) && used.get(name) !== url) name = `${hash(url)}-${name}`;
    used.set(name, url);
    plan.set(url, `/images/soal/${name}`);
  }
  return plan;
}
