// Behaviour for the design options pages (local preview only). See lab/pages.js.
// Each block below looks for its own markup and does nothing if it is not there,
// so this one file serves the options page and every demo page.
import { $, $$, lerp, clamp, reduced, ticker } from '/assets/js/util.js';

const data = JSON.parse($('#lab-data')?.textContent || '{}');

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Same markup as spread() in src/pages/components.js, for lines that change here. */
function spreadHtml(parts) {
  const gap = '<i class="spread__gap"> </i>';
  const cells = parts
    .map((part) => [...part].map((ch) => (ch === ' ' ? gap : `<i>${escapeHtml(ch)}</i>`)).join(''))
    .join(`${gap}<i class="spread__sep">/</i>${gap}`);
  return `<span class="spread" aria-hidden="true">${cells}</span><span class="sr">${escapeHtml(parts.join(', '))}</span>`;
}

function press(buttons, active) {
  buttons.forEach((b) => {
    b.classList.toggle('is-active', b === active);
    b.setAttribute('aria-pressed', String(b === active));
  });
}

/* --------------------------------------------------------- framed pages ---- */

// A framed page is drawn at a real screen size and scaled down to fit the column.
const SIZES = { desktop: [1440, 900], phone: [390, 780] };

function fitFrame(frame) {
  const w = Number(frame.dataset.w) || 1440;
  const h = Number(frame.dataset.h) || 900;
  frame.style.setProperty('--w', w);
  frame.style.setProperty('--h', h);
  frame.style.setProperty('--s', Math.min(1, frame.clientWidth / w).toFixed(4));
}

function initFrames() {
  const frames = $$('[data-lab-frame]');
  if (!frames.length) return;
  const watcher = new ResizeObserver((entries) => entries.forEach((entry) => fitFrame(entry.target)));
  frames.forEach((frame) => { fitFrame(frame); watcher.observe(frame); });

  $$('[data-lab-size]').forEach((button) => {
    button.addEventListener('click', () => {
      const frame = $(`[data-lab-frame="${button.dataset.for}"]`);
      if (!frame) return;
      [frame.dataset.w, frame.dataset.h] = SIZES[button.dataset.labSize];
      press($$(`[data-lab-size][data-for="${button.dataset.for}"]`), button);
      fitFrame(frame);
      // Load the page again so it lays itself out for the new size from the start.
      const iframe = $('iframe', frame);
      iframe.src = iframe.contentWindow.location.pathname || iframe.getAttribute('src');
    });
  });
}

/* ------------------------------------------------- A + B: the name lockup ---- */

function initName() {
  const frame = $('[data-lab-frame="name"]');
  if (!frame || !data.fonts) return;
  const iframe = $('iframe', frame);
  const fontButtons = $$('[data-lab-font]');
  const lineButtons = $$('[data-lab-line]');
  const nowFont = $('[data-lab-now-font]');
  const nowLine = $('[data-lab-now-line]');

  const BASE = 'clamp(46px, 4.75vw, 110px)'; // the name's size on the real home page
  const WIDTH = 4.572;                       // width of "Ayden Jenson" in the current font, in ems
  let font = data.fonts[0];
  let line = data.lines[0];

  /** The home page inside the frame, or null if the frame is showing something else. */
  const home = () => {
    try {
      const doc = iframe.contentDocument;
      return doc && doc.querySelector('.hero__name') ? doc : null;
    } catch { return null; }
  };

  /** The option fonts, added to the framed page once. */
  function fontsIn(doc) {
    if (!doc.labFonts) {
      doc.labFonts = new Promise((resolve) => {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = data.fontUrl;
        link.onload = link.onerror = () => resolve();
        doc.head.append(link);
      });
    }
    return doc.labFonts;
  }

  // Restyle the real home page in the frame. Each font is sized so the name
  // stays as wide as it is today (times its own "fit"), which keeps the
  // comparison fair: a wide font does not get to be bigger.
  async function apply() {
    const doc = home();
    if (!doc) return;
    const win = iframe.contentWindow;
    const title = doc.querySelector('.hero__title');
    const name = doc.querySelector('.hero__name');
    const role = doc.querySelector('.hero__role');
    let style = doc.getElementById('lab-override');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'lab-override';
      doc.head.append(style);
    }
    await fontsIn(doc);
    try { await doc.fonts.load(`${font.style} ${font.weight} 60px ${font.family}`, 'Ayden Jenson'); } catch { /* falls back to a system font */ }

    title.style.setProperty('--lab-k', '1');
    style.textContent = `
      .hero__name { font-family: ${font.family}, serif; font-weight: ${font.weight}; font-style: ${font.style}; text-transform: ${font.caps ? 'uppercase' : 'none'}; letter-spacing: ${font.tracking}; }
      .hero__title { --name-size: calc(${BASE} * var(--lab-k, 1)); }
      .hero__role { font-size: clamp(10px, calc(${BASE} * 0.168), 13px); }`;
    role.innerHTML = spreadHtml(line.parts);
    role.style.visibility = line.parts.length ? '' : 'hidden';

    const text = name.querySelector('.chars');
    const size = parseFloat(win.getComputedStyle(name).fontSize);
    const natural = text.getBoundingClientRect().width;
    if (!size || !natural) return;
    const target = size * WIDTH * font.fit;
    title.style.setProperty('--lab-k', (target / natural).toFixed(4));
    title.style.setProperty('--name-w', `${target.toFixed(1)}px`);
  }

  /** Apply now, or bring the frame back to the home page first if someone clicked away inside it. */
  function show() {
    if (home()) apply();
    else iframe.src = '/';
  }
  iframe.addEventListener('load', apply);
  if (home()) apply();

  // The close-up cards: every name is drawn at the same width so only the letter shapes differ.
  function fitCards() {
    fontButtons.forEach((card) => {
      const view = $('.lab-font__view', card);
      const name = $('.lab-font__name', card);
      const role = $('.lab-font__role', card);
      name.style.fontSize = '100px';
      const at100 = name.getBoundingClientRect().width;
      if (!at100) return;
      const target = view.clientWidth * 0.58 * Number(name.dataset.fit || 1);
      name.style.fontSize = `${((100 * target) / at100).toFixed(2)}px`;
      role.style.width = `${target.toFixed(1)}px`;
      role.style.fontSize = `${Math.max(5, target * 0.0367).toFixed(2)}px`;
    });
  }
  fitCards();
  window.addEventListener('resize', fitCards);
  if (document.fonts) {
    document.fonts.ready.then(fitCards);
    document.fonts.addEventListener('loadingdone', fitCards);
  }

  fontButtons.forEach((button) => button.addEventListener('click', () => {
    font = data.fonts.find((f) => f.code === button.dataset.labFont) || font;
    press(fontButtons, button);
    nowFont.textContent = `${font.code} ${font.label}`;
    show();
  }));
  lineButtons.forEach((button) => button.addEventListener('click', () => {
    line = data.lines.find((l) => l.code === button.dataset.labLine) || line;
    press(lineButtons, button);
    nowLine.textContent = line.code;
    $$('.lab-font__role').forEach((el) => {
      el.innerHTML = spreadHtml(line.parts);
      el.style.visibility = line.parts.length ? '' : 'hidden';
    });
    show();
  }));
  nowFont.textContent = `${font.code} ${font.label}`;
}

/* ----------------------------------------------- C and E: option pills ---- */

function initTabs() {
  $$('[data-lab-tabs]').forEach((root) => {
    const iframe = $('iframe', root);
    const note = $('[data-lab-tab-note]', root);
    const open = $('[data-lab-tab-open]', root);
    const tabs = $$('[data-lab-tab]', root);
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      press(tabs, tab);
      iframe.src = tab.dataset.src;
      note.textContent = tab.dataset.note;
      open.href = tab.dataset.src;
    }));
  });
}

/* ------------------------------------------------------- D: small demos ---- */

/** D1. Bars over the reel: the one for the clip on screen fills up; click a bar to jump there. */
function initTimeline() {
  const root = $('[data-lab-timeline]');
  if (!root) return;
  const video = $('video', root);
  const buttons = $$('button[data-at]', root);
  const starts = buttons.map((b) => Number(b.dataset.at));
  const total = () => video.duration || 17.5;
  buttons.forEach((button, i) => {
    button.style.flexGrow = String((starts[i + 1] ?? 17.5) - starts[i]);
    button.addEventListener('click', () => {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.currentTime = starts[i] + 0.05;
      video.play().catch(() => {});
    });
  });
  ticker.add(() => {
    const t = video.currentTime || 0;
    buttons.forEach((button, i) => {
      const end = starts[i + 1] ?? total();
      button.style.setProperty('--p', clamp((t - starts[i]) / (end - starts[i]), 0, 1).toFixed(3));
      button.classList.toggle('is-on', t >= starts[i] && t < end);
    });
  });
}

/** D5. Before and after: an invisible slider covers the picture and moves the dividing line. */
function initCompare() {
  $$('[data-lab-compare]').forEach((root) => {
    const range = $('input[type="range"]', root);
    range.addEventListener('input', () => root.style.setProperty('--split', `${range.value}%`));
  });
}

/* ------------------------------------------------- Work layout: C2 grid ---- */

function initGrid() {
  const root = $('[data-lab-grid]');
  if (!root) return;
  const buttons = $$('[data-lab-filters] button', root);
  buttons.forEach((button) => button.addEventListener('click', () => {
    press(buttons, button);
    const filter = button.dataset.filter;
    $$('.lab-grid__item', root).forEach((item) => { item.hidden = filter !== 'all' && item.dataset.category !== filter; });
  }));
}

/* ------------------------------------------------- Work layout: C3 list ---- */

// Pointing at a row shows that project in the one fixed window beside the list.
function initList() {
  const root = $('[data-lab-list]');
  if (!root) return;
  const windowEl = $('[data-lab-window]', root);
  const img = $('img', windowEl);
  const video = $('video', windowEl);
  const title = $('[data-lab-window-title]', root);
  const kind = $('[data-lab-window-kind]', root);
  let current = null;

  function show(row) {
    if (row === current) return;
    current = row;
    const d = row.dataset;
    img.src = d.poster;
    title.textContent = d.title;
    kind.textContent = `${d.kind} / ${d.year}`;
    video.classList.remove('is-playing');
    video.pause();
    if (d.loop && !reduced) {
      video.src = d.loop;
      video.play().then(() => { if (current === row) video.classList.add('is-playing'); }).catch(() => {});
    } else {
      video.removeAttribute('src');
      video.load();
    }
  }
  $$('.lab-list__row', root).forEach((row) => {
    row.addEventListener('pointerenter', () => show(row));
    row.addEventListener('focus', () => show(row));
  });
  const first = $('.lab-list__row', root);
  if (first) show(first);
}

/* -------------------------------------------- Work layout: C4 filmstrip ---- */

// The wrapper is made as tall as the row is long, so scrolling down the page
// has somewhere to go while the row itself slides sideways.
function initStrip() {
  const pin = $('[data-lab-strip-pin]');
  if (!pin) return;
  const track = $('[data-lab-strip-track]', pin);
  const pinned = matchMedia('(min-width: 901px) and (hover: hover)');
  const SPEED = 1.6; // the row moves this many pixels sideways for each pixel scrolled
  let max = 0;
  let x = 0;
  const measure = () => {
    max = Math.max(0, track.scrollWidth - window.innerWidth);
    pin.style.height = pinned.matches ? `${window.innerHeight + max / SPEED}px` : '';
  };
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  pinned.addEventListener('change', measure);
  ticker.add(() => {
    if (!pinned.matches) return;
    const rect = pin.getBoundingClientRect();
    const progress = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight), 0, 1);
    x = lerp(x, -progress * max, reduced ? 1 : 0.12);
    track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
  });
}

/* ---------------------------------------- Work layout: C5 one at a time ---- */

// The page is made tall; how far it has been scrolled picks the project. The
// list slides so the chosen title sits at mid-height, and that project's
// footage (or its still, when there is no preview loop) fades in behind.
function initScroll() {
  const root = $('[data-lab-scroll]');
  if (!root) return;
  const list = $('[data-lab-scroll-list]', root);
  const items = $$('.lab-scroll__item', root);
  const layers = $$('.lab-scroll__layer', root);
  const credits = $('[data-lab-scroll-credits]', root);
  const catButtons = $$('[data-lab-scroll-cats] button', root);
  const step = () => window.innerHeight * 0.2;
  let shown = items.slice();
  let active = null;

  const layerOf = (item) => layers[items.indexOf(item)];

  function footage(layer) {
    const img = $('img', layer);
    if (img && !img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
    if (!layer.dataset.loop || reduced) return null;
    let video = $('video', layer);
    if (!video) {
      video = document.createElement('video');
      video.className = 'lab-cover';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.src = layer.dataset.loop;
      video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
      layer.append(video);
    }
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
    // Have the next picture ready before it is needed.
    [shown[index + 1], shown[index - 1]].forEach((near) => {
      const img = near && $('img', layerOf(near));
      if (img && !img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
    });
    list.style.transform = `translate3d(0, ${-(item.offsetTop + item.offsetHeight / 2).toFixed(1)}px, 0)`;
    const d = item.dataset;
    const rows = [['Type', d.kind], ['Client', d.client], ['Year', d.year], ['Length', d.length]].filter(([, value]) => value);
    credits.innerHTML = rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  }

  const layout = () => { root.style.height = `${window.innerHeight + Math.max(0, shown.length - 1) * step()}px`; };
  const pick = () => {
    const index = clamp(Math.round((window.scrollY - root.offsetTop) / step()), 0, shown.length - 1);
    activate(shown[index]);
  };

  catButtons.forEach((button) => button.addEventListener('click', () => {
    press(catButtons, button);
    const filter = button.dataset.filter;
    items.forEach((item) => { item.hidden = filter !== 'all' && item.dataset.category !== filter; });
    shown = items.filter((item) => !item.hidden);
    active = null;
    layout();
    window.scrollTo({ top: root.offsetTop, behavior: 'auto' });
    pick();
  }));

  layout();
  pick();
  window.addEventListener('scroll', pick, { passive: true });
  window.addEventListener('resize', () => { layout(); active = null; pick(); });
}

initFrames();
initName();
initTabs();
initTimeline();
initCompare();
initGrid();
initList();
initStrip();
initScroll();
