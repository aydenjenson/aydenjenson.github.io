// Behaviour for the photography options (A6). Preview only. Plain JS, no imports.
// Each option finds its own root by a data attribute and does nothing if it is absent.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

/* ------------------------------------------------------------ lightbox ---- */
// A small viewer written for these previews. Uses the site's .lightbox styles.

const lightbox = (() => {
  let box = null;
  let img, caption, closeBtn;
  let list = [];
  let index = 0;
  let opener = null;
  let token = 0;

  function build() {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.setAttribute('aria-hidden', 'true');
    box.hidden = true;
    box.innerHTML = `
      <button class="lightbox__btn lightbox__close" type="button" data-x="close">Close</button>
      <button class="lightbox__btn lightbox__prev" type="button" data-x="prev" aria-label="Previous photo">Prev</button>
      <figure class="lightbox__fig"><img alt=""><figcaption><span></span></figcaption></figure>
      <button class="lightbox__btn lightbox__next" type="button" data-x="next" aria-label="Next photo">Next</button>`;
    document.body.append(box);
    img = $('img', box);
    caption = $('figcaption span', box);
    closeBtn = $('[data-x="close"]', box);
    closeBtn.addEventListener('click', close);
    $('[data-x="prev"]', box).addEventListener('click', () => step(-1));
    $('[data-x="next"]', box).addEventListener('click', () => step(1));
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.classList.contains('lightbox__fig')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      else if (e.key === 'ArrowRight') { e.stopPropagation(); step(1); }
      else if (e.key === 'ArrowLeft') { e.stopPropagation(); step(-1); }
      else if (e.key === 'Tab') {
        const buttons = $$('button', box);
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }, true);
    let startX = null;
    box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function show() {
    const item = list[index];
    if (!item) return;
    const mine = ++token;
    box.classList.add('is-loading');
    const loader = new Image();
    loader.onload = loader.onerror = () => {
      if (mine !== token) return;
      img.src = item.src;
      img.alt = item.alt || '';
      box.classList.remove('is-loading');
    };
    loader.src = item.src;
    caption.textContent = item.label || '';
    [list[index + 1], list[index - 1]].forEach((n) => { if (n) new Image().src = n.src; });
  }

  function step(delta) {
    index = (index + delta + list.length) % list.length;
    show();
  }

  function open(items, at, from) {
    if (!box) build();
    list = items;
    index = Math.max(0, at);
    opener = from || null;
    box.hidden = false;
    box.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => box.classList.add('is-open'));
    show();
    closeBtn.focus();
  }

  function close() {
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    setTimeout(() => { if (!box.classList.contains('is-open')) { box.hidden = true; img.removeAttribute('src'); } }, 460);
    if (opener) opener.focus({ preventScroll: true });
  }

  return { open, isOpen: () => !!box && !box.hidden };
})();

const itemOf = (el) => ({ src: el.dataset.full || el.getAttribute('href'), alt: el.dataset.alt || '', label: el.dataset.label || '' });

/** Links marked data-lb open the viewer and step through the others in the same data-set. */
function initLightboxLinks() {
  $$('[data-lb]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const set = $$(`[data-lb][data-set="${el.dataset.set}"]`);
      lightbox.open(set.map(itemOf), set.indexOf(el), el);
    });
  });
}

/* ------------------------------------------------------------- option 1 ---- */
// Chapters: nothing to script; the layout is CSS (sticky names, justified rows).

/* ------------------------------------------------------------- option 2 ---- */

function initSheet() {
  const root = $('[data-sheet]');
  if (!root) return;
  const stage = $('[data-sheet-stage]', root);
  const img = $('[data-sheet-img]', root);
  const typeEl = $('[data-sheet-type]', root);
  const altEl = $('[data-sheet-alt]', root);
  const frames = $$('[data-sheet-frame]', root);
  let index = 0;
  let token = 0;

  function show(i, { scroll = true } = {}) {
    index = (i + frames.length) % frames.length;
    const f = frames[index];
    frames.forEach((b) => { const on = b === f; b.classList.toggle('is-on', on); if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    typeEl.textContent = f.dataset.type;
    altEl.textContent = f.dataset.alt;
    stage.setAttribute('aria-label', `Open this photo larger. ${f.dataset.alt}`);
    const mine = ++token;
    img.classList.add('is-out');
    const loader = new Image();
    const swap = () => {
      if (mine !== token) return;
      img.src = f.dataset.src;
      img.alt = f.dataset.alt;
      img.width = Number(f.dataset.w);
      img.height = Number(f.dataset.h);
      requestAnimationFrame(() => img.classList.remove('is-out'));
    };
    const started = Date.now();
    loader.onload = loader.onerror = () => setTimeout(swap, Math.max(0, (reduced ? 0 : 200) - (Date.now() - started)));
    loader.src = f.dataset.src;
    if (scroll) f.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    const next = frames[(index + 1) % frames.length];
    if (next) new Image().src = next.dataset.src;
  }

  frames.forEach((b, i) => b.addEventListener('click', () => show(i, { scroll: false })));
  stage.addEventListener('click', () => {
    const set = frames.map((b) => ({ src: b.dataset.full, alt: b.dataset.alt, label: b.dataset.type }));
    lightbox.open(set, index, stage);
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.isOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show(index + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show(index - 1); }
  });
  // Swipe on the viewer
  let sx = null;
  stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    sx = null;
    if (Math.abs(dx) > 48) { stage.dataset.swiped = '1'; show(index + (dx < 0 ? 1 : -1)); setTimeout(() => delete stage.dataset.swiped, 400); }
  }, { passive: true });
  stage.addEventListener('click', (e) => { if (stage.dataset.swiped) e.stopImmediatePropagation(); }, true);
}

/* ------------------------------------------------------------- option 3 ---- */

function initStrips() {
  $$('[data-strip]').forEach((strip) => {
    // Mouse wheel: turn up/down into sideways, but let the page scroll once the strip is at its end.
    strip.addEventListener('wheel', (e) => {
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = strip.scrollWidth - strip.clientWidth;
      if (max <= 0) return;
      const at = strip.scrollLeft;
      if ((e.deltaY < 0 && at <= 0) || (e.deltaY > 0 && at >= max - 1)) return;
      e.preventDefault();
      strip.scrollLeft = Math.max(0, Math.min(max, at + e.deltaY));
    }, { passive: false });

    // Drag with a mouse (touch already scrolls natively).
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    strip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; strip.classList.add('is-drag'); }
      if (moved) strip.scrollLeft = startLeft - dx;
    });
    const end = () => { if (!down) return; down = false; strip.classList.remove('is-drag'); };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    strip.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false; } }, true);
    strip.addEventListener('dragstart', (e) => e.preventDefault());
  });
}

/* ------------------------------------------------------------- option 4 ---- */

function initOne() {
  const root = $('[data-one]');
  if (!root) return;
  const img = $('[data-one-img]', root);
  const bg = $('[data-one-bg]', root);
  const typeEl = $('[data-one-type]', root);
  const altEl = $('[data-one-alt]', root);
  const stage = $('[data-one-stage]', root);
  const switches = $$('[data-one-type-btn]', root);
  const rows = $$('[data-one-row]', root);
  let t = 0;
  let i = 0;
  let token = 0;
  const frames = () => $$('[data-one-frame]', rows[t]);

  function show() {
    const list = frames();
    i = (i + list.length) % list.length;
    const f = list[i];
    list.forEach((b) => { const on = b === f; b.classList.toggle('is-on', on); if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    typeEl.textContent = f.dataset.type;
    altEl.textContent = f.dataset.alt;
    const mine = ++token;
    stage.classList.add('is-out');
    const loader = new Image();
    const started = Date.now();
    loader.onload = loader.onerror = () => setTimeout(() => {
      if (mine !== token) return;
      img.src = f.dataset.src;
      img.alt = f.dataset.alt;
      img.width = Number(f.dataset.w);
      img.height = Number(f.dataset.h);
      bg.src = f.dataset.src;
      requestAnimationFrame(() => stage.classList.remove('is-out'));
    }, Math.max(0, (reduced ? 0 : 260) - (Date.now() - started)));
    loader.src = f.dataset.src;
    // Keep the chosen small frame in view inside its own row (no page scrolling).
    const row = rows[t];
    const left = f.offsetLeft - row.clientWidth / 2 + f.offsetWidth / 2;
    row.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
    const nxt = list[(i + 1) % list.length];
    if (nxt) new Image().src = nxt.dataset.src;
  }

  function setType(n) {
    t = n; i = 0;
    switches.forEach((b, k) => { b.setAttribute('aria-pressed', String(k === t)); b.classList.toggle('is-on', k === t); });
    rows.forEach((r, k) => { r.hidden = k !== t; });
    show();
  }

  switches.forEach((b, k) => b.addEventListener('click', () => { if (k !== t) setType(k); }));
  rows.forEach((r) => $$('[data-one-frame]', r).forEach((b, k) => b.addEventListener('click', () => { i = k; show(); })));
  $('[data-one-prev]', root).addEventListener('click', () => { i -= 1; show(); });
  $('[data-one-next]', root).addEventListener('click', () => { i += 1; show(); });
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); i += 1; show(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); i -= 1; show(); }
  });
  let sx = null;
  stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    sx = null;
    if (Math.abs(dx) > 48) { i += dx < 0 ? 1 : -1; show(); }
  }, { passive: true });
  show();
}

/* ------------------------------------------------------------ home 1 ---- */

function initDoors() {
  $$('[data-doors]').forEach((root) => {
    if (reduced) return;
    const doors = $$('[data-door]', root).map((el) => ({ el, imgs: $$('.po-door__img', el), n: 0 }));
    let timers = [];
    const tick = (d) => {
      if (d.imgs.length < 2) return;
      d.imgs[d.n].classList.remove('is-on');
      d.n = (d.n + 1) % d.imgs.length;
      d.imgs[d.n].classList.add('is-on');
    };
    const start = () => {
      if (timers.length) return;
      timers = doors.map((d, k) => {
        let interval = 0;
        const first = setTimeout(() => { tick(d); interval = setInterval(() => tick(d), 5200); timers[k] = interval; }, 1400 + k * 1700);
        return first;
      });
    };
    const stop = () => { timers.forEach((id) => { clearTimeout(id); clearInterval(id); }); timers = []; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? start() : stop())), { threshold: 0.2 }).observe(root);
    } else start();
  });
}

/* ------------------------------------------------------------ home 2 ---- */

function initFeature() {
  $$('[data-feature]').forEach((root) => {
    const names = $$('[data-feature-name]', root);
    const pics = $$('[data-feature-pic]', root);
    const activate = (k) => {
      names.forEach((n, j) => { n.classList.toggle('is-on', j === k); if (j === k) n.setAttribute('aria-current', 'true'); else n.removeAttribute('aria-current'); });
      pics.forEach((p, j) => p.classList.toggle('is-on', j === k));
    };
    names.forEach((n, k) => {
      n.addEventListener('mouseenter', () => activate(k));
      n.addEventListener('focus', () => activate(k));
      // On a touch screen the first tap shows the photo; a second tap goes to the page.
      n.addEventListener('click', (e) => {
        if (coarse && !n.classList.contains('is-on')) { e.preventDefault(); activate(k); }
      });
    });
    activate(0);
  });
}

initLightboxLinks();
initSheet();
initStrips();
initOne();
initDoors();
initFeature();
