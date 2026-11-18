// Home page behaviour.
//
// 1. Hero. Each of the six projects named over the reel has a full-screen layer
//    parked off one side of the screen (the side its title sits on).
//      hover a title    a blurred strip of that project slides in from its side
//      leave the title  the strip slides back out
//      click a title    the layer opens across the whole screen, sharpens and
//                       plays; the title is swapped for "See project"
//      click the name   back to the reel
//    On phones there is no hover: tap a title to open it, tap "See project" to
//    go to its page, tap the name to return to the reel. The titles are
//    scattered there too, one to a row (three above the name, three below).
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
  const titleButton = (item) => $('[data-hero-link]', item);

  const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Same width as the "Phones" block in main.css, where the grid changes from 3 x 2 cells to one column of six.
  const narrow = matchMedia('(max-width: 900px)');

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
      const left = rect.left + rect.width / 2 < middle;
      [item, layerOf(item)].forEach((el) => {
        if (!el) return;
        el.classList.toggle('is-left', left);
        el.classList.toggle('is-right', !left);
      });
    });
  }

  // Every title is dropped at a random spot inside its own cell, on phones as
  // well as on computers. The spot is picked once per visit as a share of the
  // free room in the cell, so resizing the window (or a phone hiding its
  // address bar) moves the titles in proportion instead of reshuffling them.
  const spots = new Map(items.map((item) => [item, [Math.random(), Math.random()]]));
  function place() {
    items.forEach((item) => {
      const [fx, fy] = spots.get(item);
      // Measure the title at the corner of its cell, where it has the whole
      // row to itself, so a long title on a phone only wraps if it has to.
      item.style.left = '0px';
      item.style.top = '0px';
      item.classList.add('is-placed');
      const cell = item.parentElement.getBoundingClientRect();
      const self = item.getBoundingClientRect();
      item.style.left = `${(fx * Math.max(0, cell.width - self.width - 1)).toFixed(1)}px`;
      item.style.top = `${(fy * Math.max(0, cell.height - self.height)).toFixed(1)}px`;
    });
    setSides();
  }

  /** The small line under the name is spread to exactly the name's width (see .hero__role in main.css). */
  const title = $('.hero__title', hero);
  const nameText = $('.chars', nameButton);
  function fitRole() {
    const width = nameText ? nameText.getBoundingClientRect().width : 0;
    if (title && width) title.style.setProperty('--name-w', `${width.toFixed(1)}px`);
  }

  let resizeTimer;
  window.addEventListener('resize', () => { fitRole(); clearTimeout(resizeTimer); resizeTimer = setTimeout(place, 150); });
  narrow.addEventListener('change', place);
  place();
  fitRole();
  // Fonts can change the width of a title (and of the name) after the first placement.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { place(); fitRole(); });

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
    if (!layer) return; // never skipped while "locked": a missed leave would strand the strip on screen
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

  /** Put a title back to normal after its project closes. */
  function release(item) {
    item.classList.remove('is-active');
    titleButton(item).removeAttribute('tabindex');
    seeLink(item).tabIndex = -1;
  }

  function open(item, viaKeyboard = false) {
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
    // The title is swapped for "See project", so the keyboard follows what is visible.
    titleButton(item).tabIndex = -1;
    seeLink(item).tabIndex = 0;
    // Two frames later, so the new layer has started opening before the old one lets go.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (previousItem && previousItem !== item) release(previousItem);
      if (previousLayer && previousLayer !== layer) previousLayer.classList.remove('is-active', 'is-hovered');
      locked = false;
      if (viaKeyboard) seeLink(item).focus({ preventScroll: true });
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
    items.forEach(release);
    // The pointer (or the keyboard) is on the name now, so no title is hovered: clear any strip too.
    layers.forEach((layer) => layer.classList.remove('is-active', 'is-hovered'));
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
    // event.detail is 0 when the "click" came from Enter or Space rather than a pointer.
    if (link) open(link.closest('[data-hero-item]'), event.detail === 0);
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

  // On a phone the tagline is two stacked lines. Each line gets its own size
  // so both end up exactly as wide as the text column: a tidy block instead of
  // one long line and one short one. (Same width as the "phones" rule for
  // .statement__line in main.css.)
  const lines = $$('.statement__line', text);
  const stacked = matchMedia('(max-width: 700px)');
  function fitLines() {
    lines.forEach((line) => { line.style.fontSize = ''; });
    if (!stacked.matches || lines.length < 2) return;
    const room = text.clientWidth;
    lines.forEach((line) => {
      // Twice: text does not scale perfectly evenly, so the second pass takes out the last few pixels.
      for (let pass = 0; pass < 2; pass += 1) {
        const size = parseFloat(getComputedStyle(line).fontSize);
        const width = line.getBoundingClientRect().width;
        if (size && width && room) line.style.fontSize = `${((size * room) / width).toFixed(2)}px`;
      }
    });
  }
  fitLines();
  let fitWidth = window.innerWidth;
  window.addEventListener('resize', () => { if (window.innerWidth !== fitWidth) { fitWidth = window.innerWidth; fitLines(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLines);

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
