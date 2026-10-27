// File: src/utils/tryoutHistory.js
// Riwayat percobaan tryout, disimpan di localStorage perangkat pengunjung (tanpa akun).
const KEY = 'minatmatematika_tryout';
const MAX_PER_PAKET = 10;

const paketKey = (topicSlug, packetSlug) => `${topicSlug}/${packetSlug}`;

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveAttempt(topicSlug, packetSlug, attempt) {
  if (typeof window === 'undefined') return;
  try {
    const all = readAll();
    const k = paketKey(topicSlug, packetSlug);
    all[k] = [attempt, ...(all[k] || [])].slice(0, MAX_PER_PAKET);
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (error) {
    console.error('Gagal menyimpan riwayat tryout:', error);
  }
}

export function getAttempts(topicSlug, packetSlug) {
  if (typeof window === 'undefined') return [];
  return readAll()[paketKey(topicSlug, packetSlug)] || [];
}
