// File: src/lib/tryoutGrading.mjs
// Logika penilaian tryout (fungsi murni, bisa diuji tanpa browser).
import { normalizeShortAnswer } from './parsePacketContent.mjs';

// "3/4" -> 0.75, "12.5" -> 12.5
function toNumber(str) {
  const frac = String(str).match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (frac) return Number(frac[2]) === 0 ? NaN : Number(frac[1]) / Number(frac[2]);
  return Number(str);
}

// Cocokkan jawaban isian pengguna dengan daftar jawaban yang diterima (sudah dinormalisasi).
export function answersMatch(input, acceptedAnswers) {
  if (!Array.isArray(acceptedAnswers) || acceptedAnswers.length === 0) return false;
  const normalized = normalizeShortAnswer(String(input ?? ''));
  if (normalized === null) return false;
  const x = toNumber(normalized);
  return acceptedAnswers.some((accepted) => {
    if (accepted === normalized) return true;
    const y = toNumber(accepted);
    return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x));
  });
}

// Pilihan jawaban untuk soal kompleks: ["YA","TIDAK"] atau ["BENAR","SALAH"], mengikuti format kuncinya.
export function complexChoices(question) {
  const key = Array.isArray(question.answer) ? question.answer : [];
  return key.some((a) => a === 'YA' || a === 'TIDAK') ? ['YA', 'TIDAK'] : ['BENAR', 'SALAH'];
}

// Hasil: 'correct' | 'wrong' | 'skipped' | 'ungraded' (uraian atau kunci tidak bisa diperiksa otomatis)
export function gradeQuestion(question, userAnswer) {
  switch (question.type) {
    case 'single': {
      if (!question.answer) return 'ungraded';
      if (!userAnswer) return 'skipped';
      return userAnswer === question.answer ? 'correct' : 'wrong';
    }
    case 'complex': {
      const key = Array.isArray(question.answer) ? question.answer : [];
      if (key.length === 0) return 'ungraded';
      const given = userAnswer && typeof userAnswer === 'object' ? userAnswer : {};
      if (Object.keys(given).length === 0) return 'skipped';
      return key.every((k, i) => given[i] === k) ? 'correct' : 'wrong';
    }
    case 'short': {
      if (!question.acceptedAnswers || question.acceptedAnswers.length === 0) return 'ungraded';
      if (typeof userAnswer !== 'string' || !userAnswer.trim()) return 'skipped';
      return answersMatch(userAnswer, question.acceptedAnswers) ? 'correct' : 'wrong';
    }
    default:
      return 'ungraded';
  }
}

export function gradeAttempt(questions, answers) {
  const items = questions.map((q) => ({
    id: q._id,
    number: q.number,
    type: q.type,
    status: gradeQuestion(q, answers[q._id]),
  }));
  const count = (s) => items.filter((i) => i.status === s).length;
  const correct = count('correct');
  const wrong = count('wrong');
  const skipped = count('skipped');
  const ungraded = count('ungraded');
  const gradable = correct + wrong + skipped;
  return {
    items,
    correct,
    wrong,
    skipped,
    ungraded,
    gradable,
    score: gradable ? Math.round((correct / gradable) * 100) : null,
  };
}

// 90 detik per soal yang dinilai otomatis, minimal 5 menit
export function defaultDurationSeconds(questions) {
  const gradable = questions.filter((q) => q.type !== 'essay').length;
  return Math.max(300, gradable * 90);
}
