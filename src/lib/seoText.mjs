// File: src/lib/seoText.mjs
// Judul dan deskripsi SEO yang informatif dan unik per halaman (fungsi murni, diuji di scripts/test-seo.mjs).
import { parsePacketContent } from './parsePacketContent.mjs';

const BRAND = 'Minat Matematika';

export function plainText(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g, ' ') // rumus LaTeX tidak enak dibaca di hasil pencarian
    .replace(/&nbsp;/gi, ' ')
    .replace(/&hellip;/gi, '…')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text, max) {
  const t = String(text || '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–]+$/, '')}…`;
}

export function buildPacketSeo({ topicTitle, packetTitle, content }) {
  const parsed = parsePacketContent(content || '');
  const total = parsed.questions.length;

  // Judul dipilih dari yang paling lengkap sampai yang muat (±68 karakter; sisanya terpotong di hasil pencarian)
  const candidates = [
    `Soal dan Pembahasan ${topicTitle} ${packetTitle} | ${BRAND}`,
    `Soal ${topicTitle} ${packetTitle} | ${BRAND}`,
    `Soal ${topicTitle} ${packetTitle}`,
  ];
  const title = candidates.find((c) => c.length <= 68) || truncate(candidates[2], 68);

  const base = `Latihan ${topicTitle} ${packetTitle}${total ? `: ${total} soal` : ''} beserta pembahasan lengkap untuk persiapan UTBK SNBT.`;
  const sample = truncate(plainText(parsed.questions[0]?.stemHtml), 70);
  const room = 158 - base.length - ' Contoh soal: "".'.length;
  const description = sample && room >= 25
    ? `${base} Contoh soal: "${truncate(sample, room)}"`
    : base;

  return { title, description, total };
}

export function buildTopicSeo({ title, description, paketCount }) {
  const full = `${title}: Materi, Latihan Soal & Pembahasan | ${BRAND}`;
  const pageTitle = full.length <= 68 ? full : `${title} | ${BRAND}`;

  let text = plainText(description);
  const extra = paketCount ? ` Tersedia ${paketCount} paket latihan soal dengan pembahasan.` : '';
  if (text.length < 70) text = `${text}${text && !/[.!?]$/.test(text) ? '.' : ''}${text ? '' : `Belajar materi ${title} beserta latihan soal dan pembahasan.`}${extra}`.trim();
  return { title: pageTitle, description: truncate(text, 160) };
}
