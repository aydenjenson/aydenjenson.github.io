// Work page: one project at a time.
//
// The page is made tall; how far it has been scrolled picks the project. The
// list of titles slides so the chosen one sits at mid-height, and that
// project's footage (or its still, when it has no preview loop) fades in
// behind. Markup: src/pages/work.js. Styles: main.css section 7.
import { $, $$, clamp, reduced, saveData } from './util.js';

const STEP = 0.2; // one project for every fifth of a screen scrolled

export default function initWork() {
  const root = $('[data-work]');
  if (!root) return;
  const list = $('[data-work-list]', root);
  const items = $$('.work__item', root);
  const layers = $$('.work__layer', root);
  const credits = $('[data-work-credits]', root);
  const catButtons = $$('[data-work-cats] button', root);
  const step = () => window.innerHeight * STEP;
  const layerOf = (item) => layers[items.indexOf(item)];
  let shown = items.slice();
  let active = null;

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
    list.style.transform = `translate3d(0, ${(-(item.offsetTop + item.offsetHeight / 2)).toFixed(1)}px, 0)`;
    const d = item.dataset;
    const rows = [['Type', d.kind], ['Client', d.client], ['Year', d.year], ['Length', d.length]].filter(([, value]) => value);
    credits.innerHTML = rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  }

  const top = () => root.getBoundingClientRect().top + window.scrollY;
  const layout = () => { root.style.height = `${window.innerHeight + Math.max(0, shown.length - 1) * step()}px`; };
  const indexNow = () => clamp(Math.round((window.scrollY - top()) / step()), 0, shown.length - 1);
  const pick = () => activate(shown[indexNow()]);
  const goTo = (index, smooth = true) => {
    window.scrollTo({ top: top() + clamp(index, 0, shown.length - 1) * step(), behavior: smooth && !reduced ? 'smooth' : 'auto' });
  };

  catButtons.forEach((button) => button.addEventListener('click', () => {
    catButtons.forEach((b) => {
      b.classList.toggle('is-active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    const filter = button.dataset.filter;
    items.forEach((item) => { item.hidden = filter !== 'all' && item.dataset.category !== filter; });
    shown = items.filter((item) => !item.hidden);
    active = null;
    layout();
    goTo(0, false);
    pick();
  }));

  // Keyboard. Tab moves through the titles and the page follows; the arrow
  // keys step one project at a time while the list is on screen.
  list.addEventListener('focusin', (event) => {
    const item = event.target.closest('.work__item');
    const index = shown.indexOf(item);
    if (index >= 0 && item !== active) goTo(index, false);
  });
  window.addEventListener('keydown', (event) => {
    const dir = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!dir || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest && event.target.closest('input, textarea, select')) return;
    const index = indexNow();
    const past = window.scrollY > top() + (shown.length - 1) * step() + 4; // already below the list, on the way to the footer
    if (past || (dir > 0 && index >= shown.length - 1) || (dir < 0 && index <= 0)) return;
    event.preventDefault();
    goTo(index + dir);
  });

  layout();
  pick();
  window.addEventListener('scroll', pick, { passive: true });
  let width = window.innerWidth;
  window.addEventListener('resize', () => {
    layout();
    // The list is laid out again when the width changes, so the middle title has to be found again.
    if (window.innerWidth !== width) { width = window.innerWidth; active = null; }
    pick();
  });
  // Coming back with the Back button restores the scroll position after this script has run.
  window.addEventListener('pageshow', () => { active = null; pick(); });
  // The serif arrives a moment after the page; the titles change height with it.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { active = null; pick(); });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
