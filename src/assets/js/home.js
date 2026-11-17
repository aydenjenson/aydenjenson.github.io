// Home page behaviour.
//
// 1. Hero. Every featured project has a full-screen layer parked off one side
//    of the screen (the side its title sits on).
//      hover a title    a blurred strip of that project slides in from its side
//      leave the title  the strip slides back out
//      click a title    the layer opens across the whole screen, sharpens and
//                       plays; the title is swapped for "See project"
//      click the name   back to the reel
//    On phones there is no hover: tap a title to open it, tap "See project" to
//    go to its page, tap the name to return to the reel.
//    The CSS in main.css (section 6) does the moving; this file only adds and
//    removes the classes is-left / is-right / is-hovered / is-active.
// 2. A soft blur spot trails the pointer while it is over the name.
// 3. The statement lights up word by word as you scroll.
// 4. The stills strip slides sideways as the page scrolls.
import { $, $$, lerp, clamp, reduced, saveData, ticker } from './util.js';

const T = 700; // milliseconds; keep in step with --hero-t in main.css

export default function initHome() {
  initHero();
  initStatement();
  initStills();
}

/* -------------------------------------------------------------------- hero ---- */

function initHero() {
  const hero = $('[data-hero]');
  if (!hero) return;
  const reel = $('[data-hero-reel]', hero);
  const nameButton = $('[data-hero-name]', hero);
  const lens = $('[data-hero-lens]', hero);
  const items = $$('[data-hero-item]', hero);
  const layers = new Map($$('[data-hero-layer]', hero).map((el) => [el.dataset.heroLayer, el]));
  const layerOf = (item) => layers.get(item.dataset.project);
  const seeLink = (item) => $('[data-hero-see]', item);

  const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Same condition as the "Phones and touch screens" block in main.css.
  const compact = matchMedia('(max-width: 900px), (hover: none)');

  let locked = false;       // true for a moment while a click is being applied
  let activeItem = null;    // the title that is currently open, if any
  let activeLayer = reel;   // what is filling the screen right now
  let inView = true;
  let pauseTimer;

  /* ---- footage ---- */

  /** The layer's <video>, created the first time it is needed. */
  function videoOf(layer, create = true) {
    let video = $('video', layer);
    if (video || !create) return video;
    const src = (window.innerWidth >= 1100 && layer.dataset.loopHd) || layer.dataset.loop || layer.dataset.loopHd;
    if (!src || reduced || saveData) return null;
    video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.preload = layer === reel ? 'auto' : 'metadata';
    video.src = src;
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    layer.append(video);
    layer.classList.add('has-video'); // layers without footage get a slow drift instead (see main.css)
    return video;
  }

  /** Play one layer's footage and pause all the others. */
  function play(layer) {
    [reel, ...layers.values()].forEach((other) => {
      if (other === layer) return;
      const video = videoOf(other, false);
      if (video) video.pause();
    });
    const video = videoOf(layer);
    if (video && inView) video.play().catch(() => {});
  }

  // Each layer starts with a tiny still (it is only ever seen blurred) and
  // swaps to the full-size one the first time its title is hovered or opened.
  layers.forEach((layer) => {
    const img = $('img', layer);
    if (img && !img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
  });
  function sharpen(layer) {
    const img = $('img', layer);
    const full = layer.dataset.still;
    if (!img || !full || img.dataset.full) return;
    img.dataset.full = '1';
    const loader = new Image();
    loader.onload = () => { img.src = full; };
    loader.src = full;
  }

  /* ---- where the titles sit ---- */

  /** Each layer comes in from the side of the screen its title is on. */
  function setSides() {
    const middle = window.innerWidth / 2;
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const left = compact.matches || rect.left + rect.width / 2 < middle;
      [item, layerOf(item)].forEach((el) => {
        if (!el) return;
        el.classList.toggle('is-left', left);
        el.classList.toggle('is-right', !left);
      });
    });
  }

  /** Drop every title at a random spot inside its own cell (new on each visit). */
  function place() {
    items.forEach((item) => {
      if (compact.matches) {
        item.classList.remove('is-placed');
        item.style.left = '';
        item.style.top = '';
        return;
      }
      const cell = item.parentElement.getBoundingClientRect();
      const self = item.getBoundingClientRect();
      item.style.left = `${Math.random() * Math.max(0, cell.width - self.width)}px`;
      item.style.top = `${Math.random() * Math.max(0, cell.height - self.height)}px`;
      item.classList.add('is-placed');
    });
    setSides();
  }

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(place, 150); });
  compact.addEventListener('change', place);
  place();
  // Fonts can change the width of a title after the first placement.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

  /* ---- hover: a strip of the project slides in ---- */

  const peek = (item) => {
    const layer = layerOf(item);
    if (!layer || locked) return;
    clearTimeout(pauseTimer);
    layer.classList.add('is-hovered');
    sharpen(layer);
    videoOf(layer); // start fetching, so a click can play straight away
  };
  const unpeek = (item) => {
    const layer = layerOf(item);
    if (!layer || locked) return;
    layer.classList.remove('is-hovered');
    pauseTimer = setTimeout(() => {
      if (layer === activeLayer) return;
      const video = videoOf(layer, false);
      if (video) video.pause();
    }, T / 2);
  };

  if (hoverable) {
    hero.addEventListener('pointerover', (event) => {
      const item = event.target.closest('[data-hero-item]');
      if (item && !item.contains(event.relatedTarget)) peek(item);
    });
    hero.addEventListener('pointerout', (event) => {
      const item = event.target.closest('[data-hero-item]');
      if (item && !item.contains(event.relatedTarget)) unpeek(item);
    });
  }
  // Keyboard: focusing a title with Tab shows the same strip.
  items.forEach((item) => {
    const link = $('[data-hero-link]', item);
    link.addEventListener('focus', () => { if (link.matches(':focus-visible')) peek(item); });
    link.addEventListener('blur', () => { if (!item.matches(':hover')) unpeek(item); });
  });

  /* ---- click: open a project, or go back to the reel ---- */

  function open(item) {
    const layer = layerOf(item);
    if (!layer) return;
    locked = true;
    clearTimeout(pauseTimer);
    const previousItem = activeItem;
    const previousLayer = activeLayer;
    activeItem = item;
    activeLayer = layer;
    sharpen(layer);
    videoOf(layer);
    item.classList.add('is-active');
    layer.classList.add('is-active');
    nameButton.classList.add('is-active');
    seeLink(item).tabIndex = 0;
    // Two frames later, so the new layer has started opening before the old one lets go.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (previousItem && previousItem !== item) {
        previousItem.classList.remove('is-active');
        seeLink(previousItem).tabIndex = -1;
      }
      if (previousLayer && previousLayer !== layer) previousLayer.classList.remove('is-active');
      locked = false;
    }));
    setTimeout(() => play(layer), T * 0.5);
  }

  function backToReel() {
    locked = true;
    clearTimeout(pauseTimer);
    // The reel comes back into focus as the project slides away.
    if (!reduced && reel.animate) {
      reel.animate([{ filter: 'blur(30px)' }, { filter: 'blur(0px)' }], { duration: T, delay: T * 0.25, easing: 'ease-out', fill: 'backwards' });
    }
    items.forEach((item) => { item.classList.remove('is-active'); seeLink(item).tabIndex = -1; });
    layers.forEach((layer) => layer.classList.remove('is-active'));
    nameButton.classList.remove('is-active');
    activeItem = null;
    activeLayer = reel;
    play(reel);
    requestAnimationFrame(() => { locked = false; });
  }

  hero.addEventListener('click', (event) => {
    const link = event.target.closest('[data-hero-link]');
    const name = event.target.closest('[data-hero-name]');
    if ((!link && !name) || locked) return;
    // Ignore further clicks on the titles until this change has finished moving.
    items.forEach((item) => {
      item.style.pointerEvents = 'none';
      setTimeout(() => { item.style.pointerEvents = ''; }, T);
    });
    if (link) open(link.closest('[data-hero-item]'));
    else backToReel();
  });

  /* ---- start, and rest when the hero is off screen ---- */

  play(reel);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      const video = videoOf(activeLayer, false);
      if (!video) return;
      if (inView) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.05 }).observe(hero);
  }

  /* ---- the blur spot that trails the pointer over the name ---- */

  if (hoverable && lens && !reduced) {
    let tx = 0, ty = 0, x = 0, y = 0, started = false;
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      tx = event.clientX - rect.left;
      ty = event.clientY - rect.top;
      if (!started) { x = tx; y = ty; started = true; }
    }, { passive: true });
    nameButton.addEventListener('pointerenter', () => hero.classList.add('is-name-hover'));
    nameButton.addEventListener('pointerleave', () => hero.classList.remove('is-name-hover'));
    ticker.add(() => {
      if (!inView || !started) return;
      x = lerp(x, tx, 0.08);
      y = lerp(y, ty, 0.08);
      lens.style.setProperty('--lx', `${x.toFixed(1)}px`);
      lens.style.setProperty('--ly', `${y.toFixed(1)}px`);
    });
  }
}

/* --------------------------------------------------------------- statement ---- */

function initStatement() {
  const section = $('[data-statement]');
  const text = section && $('[data-words]', section);
  if (!text) return;
  const words = $$('.word', text);
  if (reduced || !('IntersectionObserver' in window)) { words.forEach((w) => w.classList.add('is-on')); return; }

  let visible = false;
  let lit = -1;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '20% 0px' }).observe(section);

  ticker.add(() => {
    if (!visible) return;
    const rect = text.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = clamp((vh * 0.9 - rect.top) / (rect.height + vh * 0.42), 0, 1);
    const count = Math.round(progress * words.length * 1.12);
    if (count === lit) return;
    lit = count;
    words.forEach((w, i) => w.classList.toggle('is-on', i < count));
  });
}

/* ------------------------------------------------------------- stills strip ---- */

function initStills() {
  const track = $('[data-stills]');
  if (!track) return;
  const viewport = track.parentElement;
  if (reduced || !('IntersectionObserver' in window)) { viewport.style.overflowX = 'auto'; return; }

  let visible = false;
  let x = 0;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '10% 0px' }).observe(viewport);

  ticker.add(() => {
    if (!visible) return;
    const rect = viewport.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const max = Math.max(0, track.scrollWidth - window.innerWidth);
    x = lerp(x, -progress * max, 0.1);
    track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
  });
}
