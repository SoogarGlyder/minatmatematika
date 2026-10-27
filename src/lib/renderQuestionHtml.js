// File: src/lib/renderQuestionHtml.js
// Membersihkan HTML soal/pembahasan lalu merender rumus $...$ dengan KaTeX (sama seperti halaman paket).
import sanitizeHtml from 'sanitize-html';
import katex from 'katex';

const SANITIZE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'div', 'span', 'br', 'hr', 'details', 'summary',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height', 'title'],
    div: ['class', 'style', 'id'],
    span: ['class', 'style', 'id'],
    ul: ['class', 'style', 'id'], ol: ['class', 'style', 'id'], li: ['class', 'style', 'id'],
    h1: ['class', 'style', 'id'], h2: ['class', 'style', 'id'], h3: ['class', 'style', 'id'],
    hr: ['class', 'style', 'id'], br: ['class', 'style', 'id'], p: ['class', 'style', 'id'],
    a: ['href', 'target', 'id'],
    details: ['style', 'class', 'open'], summary: ['style', 'class'],
    table: ['style', 'class', 'width'],
    thead: ['style', 'class'], tbody: ['style', 'class'], tr: ['style', 'class'],
    th: ['style', 'class'], td: ['style', 'class'],
  },
  allowedSchemes: ['http', 'https', 'data', 'mailto'],
};

export function renderQuestionHtml(html) {
  if (!html) return '';
  // "&dots;" bukan entitas HTML yang valid dan tampil mentah; samakan dengan titik tiga
  const clean = sanitizeHtml(String(html).replace(/&dots;/g, '&hellip;').replace(/\n/g, ' '), SANITIZE_OPTIONS);
  return clean.replace(/\$([^$]+)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.replaceAll('&amp;', '&'), { throwOnError: false });
    } catch {
      return match;
    }
  });
}

// Soal kompleks menyimpan tabel pernyataan di stemHtml; di tryout tabel itu dibangun ulang dari
// field `statements`, jadi tabel asli dibuang agar tidak tampil dobel.
export function stemWithoutTable(html) {
  return String(html || '').replace(/<table[\s\S]*?<\/table>/gi, '');
}
