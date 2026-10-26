// File: src/lib/parsePacketContent.mjs
// Memecah konten HTML satu paket soal menjadi soal-soal terstruktur.
// Fungsi murni (tanpa DB / DOM) supaya bisa dipakai di script migrasi, API, dan client.
//
// Format konten yang dikenali (sama dengan engine CBT lama di PacketClient):
//   <h3>Nomor N</h3>                          -> pemisah antar soal
//   <p>A. ...<br />B. ...<br />E. ...</p>    -> opsi pilihan ganda
//   <details>...Jawaban: X...</details>       -> pembahasan + kunci
//   "Pernyataan N: BENAR/SALAH/YA/TIDAK"      -> soal kompleks (tabel pernyataan)

const QUESTION_SPLIT = /(?=<h3[^>]*>\s*Nomor\s+\d+\s*<\/h3>)/i;
const QUESTION_HEAD = /^<h3[^>]*>\s*Nomor\s+(\d+)\s*<\/h3>/i;

const stripTags = (s) => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();

// Normalisasi jawaban isian numerik: "270 m" -> "270", "12,5 cm" -> "12.5", "1.000" -> "1000", "3/4" -> "3/4".
// Mengembalikan null jika tidak ada TEPAT satu angka (perlu dicek manual / dicocokkan manual).
export function normalizeShortAnswer(text) {
  if (typeof text !== 'string') return null;
  const t = text.replace(/&nbsp;/gi, ' ').replace(/\$/g, '').trim();
  const nums = t.match(/-?\d+(?:[.,]\d+)*(?:\/\d+)?/g);
  if (!nums || nums.length !== 1) return null;
  let n = nums[0];
  if (/^-?\d{1,3}(\.\d{3})+$/.test(n)) n = n.replace(/\./g, ''); // pemisah ribuan
  return n.replace(',', '.');
}

function findSingleAnswer(token) {
  const m =
    token.match(/Jawaban:\s*<strong>\s*([A-E])\s*<\/strong>/i) ||
    token.match(/<strong>\s*Jawaban:\s*([A-E])\s*<\/strong>/i) ||
    token.match(/Jawaban\s*:\s*([A-E])\b/i);
  return m ? m[1].toUpperCase() : null;
}

// Kunci dari kalimat penutup pembahasan. Contoh yang dikenali:
//   <strong>Jadi jawabannya adalah D. 2</strong>
//   <strong>Jadi jawaban untuk soal ini adalah B. $2\sqrt{2}$</strong>
//   Jadi, yang <strong>bukan</strong> bilangan rasional adalah <strong>C. $\sqrt{2}$</strong>.
// Dipakai sebagai cadangan, hanya pada bagian akhir pembahasan; jika ada beberapa kalimat serupa,
// yang paling akhir yang dipakai. Kalimat bersyarat seperti "jawabannya (dengan asumsi ...) adalah A"
// sengaja TIDAK dikenali supaya soal cacat tetap ditandai needsReview.
function findSentenceAnswer(text) {
  const patterns = [
    /jawaban(?:nya)?(?:\s+untuk\s+soal\s+ini)?\s+(?:yang\s+(?:tepat|benar)\s+)?adalah\s*:?\s*(?:<[^>]*>\s*)*\(?([A-E])\)?(?=[\s.,<)]|$)/g,
    /adalah\s*(?:<[^>]*>\s*)+\(?([A-E])\.\s/g,
  ];
  let best = null;
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      if (!best || m.index > best.index) best = { index: m.index, letter: m[1] };
    }
  }
  return best ? best.letter : null;
}

function findComplexAnswers(token) {
  const withTag = [...token.matchAll(/Pernyataan\s+\d+:\s*<(?:strong|b|em)>\s*(YA|TIDAK|BENAR|SALAH)\s*<\/(?:strong|b|em)>/gi)];
  if (withTag.length) return withTag.map((m) => m[1].toUpperCase());
  const plain = [...token.matchAll(/Pernyataan\s+\d+:\s*(YA|TIDAK|BENAR|SALAH)/gi)];
  return plain.length ? plain.map((m) => m[1].toUpperCase()) : null;
}

// Soal isian singkat: kunci berupa teks/angka, mis. <strong>Jawaban: 270 m</strong>
function findShortAnswer(token) {
  const m =
    token.match(/<strong>\s*Jawaban\s*:\s*([^<]{1,80}?)\s*<\/strong>/i) ||
    token.match(/Jawaban\s*:\s*<strong>\s*([^<]{1,80}?)\s*<\/strong>/i);
  const text = m ? stripTags(m[1]) : '';
  return text || null;
}

// Cari blok "A. ... <br/> B. ... <br/> E. ..." dalam satu <p>/<div> lalu pecah per opsi.
function extractOptions(body) {
  const block = body.match(/<(p|div)>((?:\s|&nbsp;)*A\.[\s\S]*?)<\/\1>/);
  if (!block) return null;

  const options = [];
  for (const segment of block[2].split(/<br\s*\/?>/i)) {
    const m = segment.match(/^(?:\s|&nbsp;)*([A-E])\.(?:\s|&nbsp;)*([\s\S]*)$/);
    if (!m) continue;
    options.push({ key: m[1].toUpperCase(), html: m[2].trim() });
  }

  const contiguous = options.length >= 2 && options.every((o, i) => o.key === 'ABCDE'[i]);
  return contiguous ? { options, matched: block[0] } : null;
}

function extractStatements(body) {
  const rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const statements = [];
  for (const row of rows) {
    if (/<th[\s>]/i.test(row[1])) continue; // lewati baris header tabel
    const cell = row[1].match(/<td[^>]*>([\s\S]*?)<\/td>/i);
    if (cell) statements.push(cell[1].trim());
  }
  return statements;
}

function extractExplanation(detailsHtml) {
  if (!detailsHtml) return '';
  return detailsHtml
    .replace(/^<details[^>]*>/i, '')
    .replace(/<\/details>\s*$/i, '')
    .replace(/<summary[\s\S]*?<\/summary>/i, '')
    .trim()
    .replace(/^<div>\s*/i, '')
    .replace(/\s*<\/div>$/i, '')
    .replace(/<p>\s*<strong>\s*Jawaban\s*:\s*[^<]{1,80}<\/strong>\s*<\/p>/i, '')
    .trim();
}

export function parsePacketContent(html) {
  const result = { intro: '', supportHtml: '', questions: [], warnings: [] };
  if (!html || typeof html !== 'string') return result;

  let intro = '';
  const chunks = [];

  html.split(QUESTION_SPLIT).forEach((token) => {
    const head = token.match(QUESTION_HEAD);
    if (head) chunks.push({ number: Number(head[1]), token, rest: token.slice(head[0].length) });
    else intro += token;
  });

  result.intro = intro.trim();
  // Perilaku lama: teks pendukung hanya dianggap ada jika intro menyebut "teks pendukung" / "teks N"
  result.supportHtml = /teks\s+(pendukung|\d+)/i.test(intro) ? result.intro : '';
  if (result.supportHtml) {
    result.warnings.push('Intro berisi "teks pendukung": dipakai sebagai supportHtml untuk SEMUA nomor (sama seperti engine lama).');
  }

  const seen = new Set();

  chunks.forEach(({ number, token, rest }) => {
    const warn = (msg) => result.warnings.push(`Nomor ${number}: ${msg}`);
    // Masalah data yang membuat soal tidak layak dinilai otomatis: tandai needsReview
    let needsReview = false;
    const flag = (msg) => {
      needsReview = true;
      warn(msg);
    };

    if (seen.has(number)) flag('nomor ganda dalam satu paket.');
    seen.add(number);

    const detailsStart = rest.search(/<details[\s>]/i);
    const detailsEnd = rest.lastIndexOf('</details>');
    const hasDetails = detailsStart >= 0 && detailsEnd > detailsStart;

    const body = (detailsStart >= 0 ? rest.slice(0, detailsStart) : rest).replace(/<hr[^>]*>/gi, '').trim();
    const detailsHtml = hasDetails ? rest.slice(detailsStart, detailsEnd + '</details>'.length) : '';
    const trailing = hasDetails ? rest.slice(detailsEnd + '</details>'.length) : '';

    if (!hasDetails) warn('tidak ada <details> pembahasan.');
    if (stripTags(trailing.replace(/<hr[^>]*>/gi, ''))) {
      warn('ada konten setelah pembahasan (mungkin teks pendukung nomor berikutnya) dan TIDAK ikut dimigrasi.');
    }

    const single = findSingleAnswer(token);
    const complex = single ? null : findComplexAnswers(token);
    const sentence = single || complex ? null : findSentenceAnswer(hasDetails ? detailsHtml.slice(-700) : token);
    const short = single || complex || sentence ? null : findShortAnswer(token);
    const letter = single || sentence;

    // Pembahasan bertahap (a, b, c, ...) memakai beberapa <details>: simpan utuh agar HTML tetap valid
    const multiDetails = (detailsHtml.match(/<details[\s>]/gi) || []).length > 1;
    const explanationHtml = multiDetails ? detailsHtml.trim() : extractExplanation(detailsHtml);

    const question = {
      number,
      type: letter ? 'single' : complex ? 'complex' : short ? 'short' : 'single',
      stemHtml: body,
      options: [],
      statements: [],
      answer: letter || complex || short || '',
      acceptedAnswers: [],
      explanationHtml,
      needsReview: false,
    };

    if (!letter && !complex && !short) {
      // Tanpa kunci: jika ada opsi A-E berarti data kurang (perlu diperbaiki); jika tidak ada opsi
      // tetapi ada pembahasan, ini soal uraian (dikerjakan sendiri lalu dicocokkan dengan pembahasan).
      const found = extractOptions(body);
      if (found) {
        question.options = found.options;
        question.stemHtml = body.replace(found.matched, '').trim();
        flag('opsi A-E ada tetapi kunci jawaban tidak ditemukan.');
      } else if (explanationHtml) {
        question.type = 'essay';
      } else {
        flag('kunci jawaban tidak ditemukan.');
      }
    } else if (short) {
      const normalized = normalizeShortAnswer(short);
      if (normalized !== null) question.acceptedAnswers = [normalized];
      else flag(`isian "${short}" tidak punya angka tunggal; acceptedAnswers kosong (cek manual).`);
    } else if (letter) {
      const found = extractOptions(body);
      if (found) {
        question.options = found.options;
        question.stemHtml = body.replace(found.matched, '').trim();
        if (!found.options.some((o) => o.key === letter)) flag(`kunci ${letter} tidak ada di daftar opsi.`);
      } else {
        flag('opsi A-E tidak terbaca (format berbeda); seluruh teks disimpan di stemHtml.');
      }
    } else {
      question.statements = extractStatements(body);
      if (question.statements.length !== complex.length) {
        flag(`jumlah pernyataan di tabel (${question.statements.length}) tidak sama dengan jumlah kunci (${complex.length}).`);
      }
    }

    question.needsReview = needsReview;
    result.questions.push(question);
  });

  if (chunks.length === 0 && html.trim()) {
    result.warnings.push('Tidak ada penanda <h3>Nomor N</h3>; paket ini tidak menghasilkan soal.');
  }

  return result;
}
