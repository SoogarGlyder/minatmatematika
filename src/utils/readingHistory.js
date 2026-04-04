const HISTORY_KEY = 'mm_learning_history';

export const saveReadingHistory = (kategoriSlug, paketSlug, paketTitle) => {
  if (typeof window === 'undefined') return;

  try {
    const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');

    currentHistory[kategoriSlug] = {
      paketSlug,
      paketTitle,
      lastReadAt: new Date().toISOString(),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
  } catch (error) {
    console.error("Gagal menyimpan histori belajar:", error);
  }
};

export const getReadingHistory = (kategoriSlug) => {
  if (typeof window === 'undefined') return null;

  try {
    const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return currentHistory[kategoriSlug] || null;
  } catch (error) {
    return null;
  }
};