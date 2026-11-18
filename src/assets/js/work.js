// Work page: one project at a time.
//
// The list of titles is a real scroll box that fills the left of the screen.
// Whichever title sits at its vertical middle is the active one: it is shown
// bold, and that project's footage (or its still, when it has no preview loop)
// plays behind. The page itself does not scroll while the visitor is in the
// list; at either end the page takes over, so the footer is still reachable.
//
//   Phone / touch screen   drag the list with a finger; it scrolls freely.
//   Mouse                  rest the pointer below the middle of the list and it
//                          scrolls on by itself (faster the lower the pointer,
//                          nothing happens near the middle, so the middle title
//                          can be clicked); rest it above the middle and it
//                          scrolls back. The wheel and trackpad scroll it too,
//                          wherever they are on the section.
//   Keyboard               Arrow Up / Down step one title; Tab brings a focused
//                          title to the middle.
//
// The position is remembered for the Back button. Markup: src/pages/work.js.
// Styles: main.css section 7.
import { $, $$, clamp, reduced, saveData, finePointer, ticker } from './util.js';

const DEAD_ZONE = 0.18; // fraction of half the list height around the middle where nothing moves
const MAX_SPEED = 420; // pixels per second at the very top or bottom of the list
const CURVE = 1.6; // how sharply the speed grows with distance from the dead zone
const KEY = 'aj-work-index';

export default function initWork() {
  const root = $('[data-work]');
  if (!root) return;
  const list = $('[data-work-list]', root);
  const items = $$('.work__item', root);
  const layers = $$('.work__layer', root);
  const credits = $('[data-work-credits]', root);
  const catButtons = $$('[data-work-cats] button', root);
  const layerOf = (item) => layers[items.indexOf(item)];
  let shown = items.slice();
  let centres = []; // middle of each shown title, measured from the top of the list's content
  let active = null;
  let queued = false;

  /** Give a layer its pictures (most start without, so the page loads quickly). */
  function pictures(layer) {
    $$('img[data-src]', layer).forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }

  /** The layer's preview loop, created the first time it is needed. Null when there is none. */
  function footage(layer) {
    pictures(layer);
    let video = $('video', layer);
    if (video) return video;
    const src = (window.innerWidth >= 1100 && layer.dataset.loopHd) || layer.dataset.loop || layer.dataset.loopHd;
    if (!src || reduced || saveData) return null;
    video = document.createElement('video');
    video.className = 'work__media';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.preload = 'metadata';
    video.src = src;
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    layer.append(video);
    return video;
  }

  function activate(item) {
    if (!item || item === active) return;
    active = item;
    const index = shown.indexOf(item);
    shown.forEach((other, i) => {
      other.classList.toggle('is-active', other === item);
      other.style.setProperty('--d', String(Math.abs(i - index)));
    });
    layers.forEach((layer) => {
      const on = layer === layerOf(item);
      layer.classList.toggle('is-active', on);
      const video = on ? footage(layer) : $('video', layer);
      if (!video) return;
      if (on) video.play().catch(() => {});
      else video.pause();
    });
    // Have the neighbours' pictures ready before they are needed.
    [shown[index + 1], shown[index - 1]].forEach((near) => { if (near) pictures(layerOf(near)); });
    const d = item.dataset;
    const rows = [['Type', d.kind], ['Client', d.client], ['Year', d.year], ['Length', d.length]].filter(([, value]) => value);
    credits.innerHTML = rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  }

  /** Where each shown title sits. Also pads the list so the first and last title can reach the middle. */
  function measure() {
    if (!shown.length) { centres = []; return; }
    const half = list.clientHeight / 2;
    list.style.paddingTop = `${Math.max(0, half - shown[0].offsetHeight / 2).toFixed(1)}px`;
    list.style.paddingBottom = `${Math.max(0, half - shown[shown.length - 1].offsetHeight / 2).toFixed(1)}px`;
    centres = shown.map((item) => item.offsetTop + item.offsetHeight / 2);
  }

  const targetOf = (index) => centres[clamp(index, 0, shown.length - 1)] - list.clientHeight / 2;
  const indexNow = () => {
    const middle = list.scrollTop + list.clientHeight / 2;
    let best = 0;
    centres.forEach((c, i) => { if (Math.abs(c - middle) < Math.abs(centres[best] - middle)) best = i; });
    return best;
  };
  const pick = () => { queued = false; if (shown.length) activate(shown[indexNow()]); };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(pick); } };
  const goTo = (index, smooth = true) => {
    list.scrollTo({ top: targetOf(index), behavior: smooth && !reduced ? 'smooth' : 'auto' });
  };
  /** Measure again and put the active title back in the middle (after fonts load, the window resizes, ...). */
  function remeasure() {
    measure();
    const index = shown.indexOf(active);
    if (index >= 0) list.scrollTop = targetOf(index);
    pick();
  }

  list.addEventListener('scroll', queue, { passive: true });

  // Filter: hidden titles are skipped and the list goes back to its first title.
  catButtons.forEach((button) => button.addEventListener('click', () => {
    catButtons.forEach((b) => {
      b.classList.toggle('is-active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    const filter = button.dataset.filter;
    items.forEach((item) => { item.hidden = filter !== 'all' && item.dataset.category !== filter; });
    shown = items.filter((item) => !item.hidden);
    active = null;
    measure();
    list.scrollTop = 0;
    if (shown.length) list.scrollTop = targetOf(0);
    pick();
  }));

  // Mouse: rest the pointer on the lower or upper part of the list and it scrolls by itself.
  if (finePointer && !reduced) {
    let pointerY = null;
    let pos = 0;
    let stop = null;
    const drift = (time, dt) => {
      if (pointerY === null) return;
      const rect = list.getBoundingClientRect();
      const v = clamp((pointerY - (rect.top + rect.height / 2)) / (rect.height / 2), -1, 1);
      const away = Math.abs(v);
      if (away <= DEAD_ZONE) return;
      const speed = MAX_SPEED * Math.pow((away - DEAD_ZONE) / (1 - DEAD_ZONE), CURVE) * Math.sign(v);
      // The browser may round scrollTop to whole pixels, so slow speeds are kept in `pos`.
      if (Math.abs(list.scrollTop - pos) > 1.5) pos = list.scrollTop; // the wheel or a key moved it meanwhile
      pos = clamp(pos + (speed * dt) / 1000, 0, list.scrollHeight - list.clientHeight);
      list.scrollTop = pos;
    };
    const leave = () => {
      pointerY = null;
      if (stop) { stop(); stop = null; }
    };
    list.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      pointerY = event.clientY;
      if (!stop) { pos = list.scrollTop; stop = ticker.add(drift); }
    });
    list.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
  }

  // Wheel and trackpad: over the list the browser scrolls it itself. Over the
  // film or the details the movement is passed on to the list, unless the list
  // is already at that end, so the page can carry on to the footer.
  root.addEventListener('wheel', (event) => {
    if (event.ctrlKey || list.contains(event.target)) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? list.clientHeight : 1;
    const dy = event.deltaY * unit;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || !dy) return;
    const room = list.scrollHeight - list.clientHeight;
    if ((dy > 0 && list.scrollTop >= room - 1) || (dy < 0 && list.scrollTop <= 0)) return;
    event.preventDefault();
    list.scrollTop += dy;
  }, { passive: false });

  // Keyboard. Tab brings the focused title to the middle; Arrow Up / Down step
  // one title at a time while the section is on screen.
  list.addEventListener('focusin', (event) => {
    const item = event.target.closest('.work__item');
    const index = shown.indexOf(item);
    if (index >= 0) list.scrollTo({ top: targetOf(index), behavior: 'auto' });
  });
  window.addEventListener('keydown', (event) => {
    const dir = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!dir || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest && event.target.closest('input, textarea, select')) return;
    const rect = root.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.5 || rect.bottom < window.innerHeight * 0.5) return; // not looking at the list
    const index = shown.indexOf(active);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= shown.length) return; // at the end: let the page scroll on
    event.preventDefault();
    goTo(next);
  });

  // Remember the position for the Back button (the active title, by its place in the full list).
  window.addEventListener('pagehide', () => {
    try { if (active) sessionStorage.setItem(KEY, String(items.indexOf(active))); } catch (e) { /* storage blocked */ }
  });

  // Start: where the visitor left off, else the first title.
  measure();
  let start = 0;
  try {
    const saved = items[Number(sessionStorage.getItem(KEY))];
    if (saved && !saved.hidden) start = shown.indexOf(saved);
  } catch (e) { /* storage blocked */ }
  list.scrollTop = targetOf(Math.max(0, start));
  pick();

  let width = window.innerWidth;
  let height = window.innerHeight;
  window.addEventListener('resize', () => {
    // Only a real size change needs the list laid out again (the phone address bar changes the height a little).
    if (window.innerWidth === width && Math.abs(window.innerHeight - height) < 80) return;
    width = window.innerWidth;
    height = window.innerHeight;
    remeasure();
  });
  // The serif arrives a moment after the page; the titles change height with it.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
