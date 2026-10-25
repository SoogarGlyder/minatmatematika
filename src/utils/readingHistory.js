const HISTORY_KEY = 'minatmatematika_history';

export const saveReadingHistory = (topicSlug, packetSlug, packetTitle, packetNumber) => {
  if (typeof window === 'undefined') return;

  try {
    const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');

    currentHistory[topicSlug] = {
      packetSlug,
      packetTitle,
      packetNumber,
      lastReadAt: new Date().toISOString(),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
  } catch (error) {
    console.error("Gagal menyimpan history baca:", error);
  }
};

export const getReadingHistory = (topicSlug) => {
  if (typeof window === 'undefined') return null;

  try {
    const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return currentHistory[topicSlug] || null;
  } catch (error) {
    return null;
  }
};
