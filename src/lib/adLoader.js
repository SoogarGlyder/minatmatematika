// File: src/lib/adLoader.js
// Menjadwalkan permintaan iklan AdSense (adsbygoogle.push) untuk satu kotak iklan:
//  - hanya ketika kotak mendekati layar (hemat permintaan, iklan lebih sering terlihat),
//  - tidak pernah ketika kotak tersembunyi / lebarnya 0 (mis. sidebar yang disembunyikan di HP),
//  - paling banyak satu kali per kotak.
// Dependensi (window, IntersectionObserver) diberikan dari luar agar mudah diuji.
export function scheduleAdPush({ node, win, ObserverImpl, onPushed, delayMs = 200, rootMargin = '300px 0px' }) {
  let timer = null;
  let done = false;
  let observer = null;

  const tryPush = () => {
    if (done || !node || node.offsetWidth === 0) return false;
    try {
      (win.adsbygoogle = win.adsbygoogle || []).push({});
      done = true;
      if (onPushed) onPushed();
      return true;
    } catch (error) {
      console.error('AdSense Error:', error);
      return false;
    }
  };

  const later = () => {
    clearTimeout(timer);
    // jeda singkat agar CSS selesai dirender dan lebar kotak sudah pasti
    timer = setTimeout(() => {
      if (tryPush() && observer) observer.disconnect();
    }, delayMs);
  };

  if (typeof ObserverImpl === 'function') {
    observer = new ObserverImpl(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) later();
      },
      { rootMargin }
    );
    observer.observe(node);
  } else {
    later(); // browser lama tanpa IntersectionObserver
  }

  return () => {
    clearTimeout(timer);
    if (observer) observer.disconnect();
  };
}
