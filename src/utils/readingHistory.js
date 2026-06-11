const HISTORY_KEY = 'linkstart.id_history';

export const saveReadingHistory = (novelSlug, chapterSlug, chapterTitle, chapterNumber) => {
  if (typeof window === 'undefined') return;

  try {
    const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');

    currentHistory[novelSlug] = {
      chapterSlug,
      chapterTitle,
      chapterNumber,
      lastReadAt: new Date().toISOString(),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
  } catch (error) {
    console.error("Gagal menyimpan history baca:", error);
  }
};

export const getReadingHistory = (novelSlug) => {
  if (typeof window === 'undefined') return null;

  try {
    const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return currentHistory[novelSlug] || null;
  } catch (error) {
    return null;
  }
};