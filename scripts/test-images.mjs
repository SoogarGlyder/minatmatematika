// Uji penanganan gambar:  node scripts/test-images.mjs
import assert from 'node:assert/strict';
import { enhanceImages, proxiedSrc, resolveImageSource, PLACEHOLDER_SRC } from '../src/lib/imageFallback.js';

const U1 = 'https://i.postimg.cc/65kZHfYR/geometri-pengukuran-paket-09-03.png';
const U2 = 'https://i.postimg.cc/jjqXRhNv/geometri-pengukuran-paket-08-03.png';

// host yang diizinkan -> /_next/image; host lain tetap
assert.equal(proxiedSrc(U1), `/_next/image?url=${encodeURIComponent(U1)}&w=1080&q=75`);
assert.equal(proxiedSrc('https://contoh-lain.com/a.png'), null);
assert.equal(proxiedSrc('http://i.postimg.cc/a.png'), null);
assert.equal(proxiedSrc('/images/lokal.png'), null);

// Model 1 (dibungkus div) dan Model 2 (di dalam p) dari konten pengguna
const model1 = `<div style="text-align: center; margin: 20px 0;"><img src="${U1}" alt="Ilustrasi kisi-kisi langit-langit" /></div>`;
const model2 = `<p><img src="${U2}" alt="geometri-pengukuran-paket-08-03" /></p>`;
for (const [html, url] of [[model1, U1], [model2, U2]]) {
  const out = enhanceImages(html);
  assert.ok(out.includes(`src="/_next/image?url=${encodeURIComponent(url)}&w=1080&q=75"`), 'src lewat /_next/image');
  assert.ok(out.includes('onerror="'));
  assert.ok(out.includes('style="max-width:100%;height:auto"'));
  assert.ok(out.includes('loading="lazy"'));
  assert.equal(enhanceImages(out), out, 'idempoten');
}

// style yang sudah ada tidak ditimpa; host lain tidak diubah srcnya tetapi tetap punya cadangan placeholder
const other = enhanceImages('<img src="https://contoh-lain.com/a.png" style="width:50%" alt="x">');
assert.ok(other.includes('src="https://contoh-lain.com/a.png"'));
assert.ok(other.includes('style="width:50%"') && !other.includes('max-width:100%;height:auto'));
assert.ok(other.includes(PLACEHOLDER_SRC));

// &amp; pada alamat (hasil sanitize) didekode sebelum dienkode ulang
const withQuery = enhanceImages('<img src="https://i.postimg.cc/a/b.png?x=1&amp;y=2" alt="">');
assert.ok(withQuery.includes(encodeURIComponent('https://i.postimg.cc/a/b.png?x=1&y=2')));

// perilaku cadangan bertahap: 1) alamat asli langsung, 2) placeholder
{
  const out = enhanceImages(model1);
  const body = out.match(/onerror="([^"]*)"/)[1].replace(/&amp;/g, '&');
  const el = { dataset: {}, src: 'x', alt: 'a', onerror: () => {} };
  const run = new Function(body);
  run.call(el);
  assert.equal(el.src, U1, 'kegagalan pertama: coba alamat asli');
  run.call(el);
  assert.equal(el.src, PLACEHOLDER_SRC, 'kegagalan kedua: placeholder');
  assert.equal(el.onerror, null);
}

// tanpa gambar atau kosong
assert.equal(enhanceImages(''), '');
assert.equal(enhanceImages('<p>tanpa gambar</p>'), '<p>tanpa gambar</p>');

// resolveImageSource: kasus dari error nyata (penanda belum diisi) dan kasus lain yang membuat next/image error
{
  const bad = ['URL_GAMBAR_LAMPU_DAN_KRIS_ANDA_DISINI', '', '   ', undefined, null, 'javascript:alert(1)', 'ftp://x.com/a.png', 'gambar-tanpa-slash.png'];
  for (const value of bad) {
    const r = resolveImageSource(value);
    assert.equal(r.valid, false, `harus tidak valid: ${value}`);
    assert.equal(r.src, PLACEHOLDER_SRC);
  }
  assert.deepEqual(resolveImageSource('/images/a.png'), { src: '/images/a.png', unoptimized: false, valid: true });
  assert.deepEqual(resolveImageSource('https://i.postimg.cc/x.png'), { src: 'https://i.postimg.cc/x.png', unoptimized: false, valid: true });
  assert.deepEqual(resolveImageSource('//i.postimg.cc/x.png'), { src: 'https://i.postimg.cc/x.png', unoptimized: false, valid: true });
  // host yang tidak terdaftar atau http: dimuat apa adanya agar next/image tidak melempar error
  assert.equal(resolveImageSource('https://host-lain.com/x.png').unoptimized, true);
  assert.equal(resolveImageSource('http://i.postimg.cc/x.png').unoptimized, true);
  assert.equal(resolveImageSource('data:image/png;base64,AAAA').unoptimized, true);
  assert.equal(resolveImageSource('  https://i.postimg.cc/x.png  ').src, 'https://i.postimg.cc/x.png');
}

console.log('Semua pengujian gambar lulus.');
