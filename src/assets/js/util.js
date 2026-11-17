// Shared helpers for the front-end scripts. No libraries.

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const pad2 = (n) => String(n).padStart(2, '0');

/** The visitor asked their device for less motion. */
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
/** A real mouse or trackpad (not a touch screen). */
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
/** The visitor asked their browser to save data: skip background video. */
export const saveData = Boolean(navigator.connection && navigator.connection.saveData);

/**
 * One shared animation loop. ticker.add(fn) runs fn(time, dt) every frame and
 * returns a function that stops it. The loop sleeps when nothing is subscribed.
 */
const subscribers = new Set();
let running = false;
let last = 0;
function frame(time) {
  const dt = Math.min(64, time - last || 16.7);
  last = time;
  subscribers.forEach((fn) => fn(time, dt));
  if (subscribers.size) requestAnimationFrame(frame);
  else running = false;
}
export const ticker = {
  add(fn) {
    subscribers.add(fn);
    if (!running) { running = true; last = 0; requestAnimationFrame(frame); }
    return () => subscribers.delete(fn);
  },
};

/** Start a silent preview loop (the file is fetched the first time). */
export function playLoop(video) {
  if (!video) return;
  if (!video.getAttribute('src')) video.src = video.dataset.src;
  video.muted = true;
  const p = video.play();
  if (p && p.then) p.then(() => video.classList.add('is-playing')).catch(() => {});
}

/** Stop a preview loop and fade back to its poster. */
export function stopLoop(video) {
  if (!video) return;
  video.classList.remove('is-playing');
  video.pause();
}

/** Same markup as chars() in src/pages/components.js, for labels that change. */
export function setChars(el, text) {
  let i = 0;
  const words = text.split(' ').map((word) => {
    const letters = [...word].map((ch) => `<span class="ch" style="--i:${i++}">${escapeHtml(ch)}</span>`).join('');
    return `<span class="w">${letters}</span>`;
  });
  el.innerHTML = `<span class="chars" aria-hidden="true">${words.join(' ')}</span><span class="sr">${escapeHtml(text)}</span>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** 95 -> "1:35" */
export function clock(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}

/** Read the data-* attributes that templates put on project links. */
export function projectData(el) {
  const d = el.dataset;
  return {
    slug: d.slug,
    title: d.title,
    kind: d.kind,
    year: d.year,
    poster: d.poster,
    loop: d.loop || '',
    loopHd: d.loopHd || '',
    orientation: d.orientation || 'landscape',
  };
}
