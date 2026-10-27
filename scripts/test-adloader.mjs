// Uji penjadwal iklan:  node scripts/test-adloader.mjs
import assert from 'node:assert/strict';
import { scheduleAdPush } from '../src/lib/adLoader.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fakeObserver() {
  const state = { callback: null, observed: 0, disconnected: 0 };
  class Obs {
    constructor(cb) { state.callback = cb; }
    observe() { state.observed++; }
    disconnect() { state.disconnected++; }
  }
  return { Obs, state, fire: (isIntersecting) => state.callback([{ isIntersecting }]) };
}

// 1. kotak tersembunyi (lebar 0): tidak pernah meminta iklan
{
  const win = {}; const o = fakeObserver();
  scheduleAdPush({ node: { offsetWidth: 0 }, win, ObserverImpl: o.Obs, delayMs: 5 });
  o.fire(true); await sleep(20);
  assert.equal((win.adsbygoogle || []).length, 0);
}
// 2. terlihat dan mendekati layar: satu kali permintaan, observer dilepas, callback terpanggil
{
  const win = {}; const o = fakeObserver(); let pushed = 0;
  scheduleAdPush({ node: { offsetWidth: 300 }, win, ObserverImpl: o.Obs, delayMs: 5, onPushed: () => pushed++ });
  o.fire(true); o.fire(true); await sleep(20);
  assert.equal(win.adsbygoogle.length, 1);
  assert.equal(pushed, 1);
  assert.equal(o.state.disconnected, 1);
}
// 3. belum mendekati layar: tidak ada permintaan
{
  const win = {}; const o = fakeObserver();
  scheduleAdPush({ node: { offsetWidth: 300 }, win, ObserverImpl: o.Obs, delayMs: 5 });
  o.fire(false); await sleep(20);
  assert.equal((win.adsbygoogle || []).length, 0);
}
// 4. tanpa IntersectionObserver: tetap meminta iklan bila terlihat, tidak bila tersembunyi
{
  const win = {};
  scheduleAdPush({ node: { offsetWidth: 300 }, win, ObserverImpl: undefined, delayMs: 5 });
  await sleep(20);
  assert.equal(win.adsbygoogle.length, 1);
  const win2 = {};
  scheduleAdPush({ node: { offsetWidth: 0 }, win: win2, ObserverImpl: undefined, delayMs: 5 });
  await sleep(20);
  assert.equal((win2.adsbygoogle || []).length, 0);
}
// 5. dibersihkan sebelum jeda habis: tidak ada permintaan
{
  const win = {}; const o = fakeObserver();
  const cleanup = scheduleAdPush({ node: { offsetWidth: 300 }, win, ObserverImpl: o.Obs, delayMs: 30 });
  o.fire(true); cleanup(); await sleep(60);
  assert.equal((win.adsbygoogle || []).length, 0);
}
console.log('Semua pengujian penjadwal iklan lulus.');
