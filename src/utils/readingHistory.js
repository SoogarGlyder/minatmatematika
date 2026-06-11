<<<<<<< HEAD
const HISTORY_KEY = 'linkstart.id_history';

export const saveReadingHistory = (novelSlug, chapterSlug, chapterTitle, chapterNumber) => {
=======
const HISTORY_KEY = 'mm_learning_history';

export const saveReadingHistory = (kategoriSlug, paketSlug, paketTitle) => {
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  if (typeof window === 'undefined') return;

  try {
    const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');

<<<<<<< HEAD
    currentHistory[novelSlug] = {
      chapterSlug,
      chapterTitle,
      chapterNumber,
=======
    currentHistory[kategoriSlug] = {
      paketSlug,
      paketTitle,
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
      lastReadAt: new Date().toISOString(),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
  } catch (error) {
<<<<<<< HEAD
    console.error("Gagal menyimpan history baca:", error);
  }
};

export const getReadingHistory = (novelSlug) => {
=======
    console.error("Gagal menyimpan histori belajar:", error);
  }
};

export const getReadingHistory = (kategoriSlug) => {
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  if (typeof window === 'undefined') return null;

  try {
    const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
<<<<<<< HEAD
    return currentHistory[novelSlug] || null;
=======
    return currentHistory[kategoriSlug] || null;
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  } catch (error) {
    return null;
  }
};