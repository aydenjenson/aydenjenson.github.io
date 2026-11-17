// Home page behaviour.
//   1. Hero: hovering a title wipes the background over to that project's loop.
//      On touch screens the titles cycle on their own; tap one to jump to it.
//   2. Titles and name drift with the mouse.
//   3. The statement lights up word by word as you scroll.
//   4. Services rows show a floating preview that follows the pointer.
//   5. The stills strip slides sideways as the page scrolls.
import { $, $$, lerp, clamp, reduced, finePointer, saveData, ticker, projectData } from './util.js';

const EASE = 'cubic-bezier(0.77, 0, 0.18, 1)';

export default function initHome() {
  initHero();
  initStatement();
  initServicePreview();
  initStills();
}

/* -------------------------------------------------------------------- hero ---- */

function initHero() {
  const hero = $('[data-hero]');
  if (!hero) return;
  const stack = $('[data-hero-stack]', hero);
  const base = $('[data-hero-base]', hero);
  const links = $$('[data-hero-link]', hero);
  const nowKind = $('[data-hero-now-kind]', hero);
  const nowTitle = $('[data-hero-now-title]', hero);
  const title = $('.hero__title', hero);
  const items = $$('.hero__item', hero);
  const touchLayout = matchMedia('(max-width: 900px), (hover: none)');

  const reel = projectData(base);
  let current = reel.slug;
  let z = 1;
  let inView = true;

  /** Add a silent loop to a layer; it fades in over the still once it is playing. */
  function addVideo(layer, data) {
    const src = (window.innerWidth >= 1100 && data.loopHd) || data.loop || data.loopHd;
    if (!src || reduced || saveData) return;
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.preload = 'auto';
    video.src = src;
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    layer.append(video);
    video.play().catch(() => {});
  }

  /** Bring a project's footage in on a new layer, wiping from the given side. */
  function show(data, side) {
    if (!data || data.slug === current) return;
    current = data.slug;

    const layer = document.createElement('div');
    layer.className = 'hero__layer';
    layer.style.zIndex = String(++z);
    const img = new Image();
    img.className = 'hero__img';
    img.alt = '';
    img.decoding = 'async';
    img.src = data.poster;
    layer.append(img);
    stack.append(layer);
    addVideo(layer, data);

    const from = side === 'right' ? 'inset(0 0 0 100%)' : side === 'left' ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)';
    const wipe = layer.animate(
      [{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }],
      { duration: reduced ? 1 : 1000, easing: EASE, fill: 'both' },
    );
    // Footage settles from slightly zoomed-in while the wipe passes.
    layer.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: reduced ? 1 : 1600, easing: 'cubic-bezier(0.22, 0.8, 0.2, 1)', fill: 'both' });

    wipe.finished.then(() => {
      // Everything underneath is now hidden: remove it and free its video.
      [...stack.children].forEach((el) => {
        if (el === layer || Number(el.style.zIndex || 0) > Number(layer.style.zIndex)) return;
        el.querySelectorAll('video').forEach((v) => { v.pause(); v.removeAttribute('src'); v.load(); });
        el.remove();
      });
    }).catch(() => {});

    if (nowKind) nowKind.textContent = data.kind || '';
    if (nowTitle) nowTitle.textContent = data.title || '';
  }

  function activate(link) {
    links.forEach((l) => l.classList.toggle('is-active', l === link));
    if (!link) return;
    const rect = link.getBoundingClientRect();
    const side = touchLayout.matches ? 'up' : (rect.left + rect.width / 2 < window.innerWidth / 2 ? 'left' : 'right');
    show(projectData(link), side);
  }

  // Start the reel loop behind the name.
  addVideo(base, reel);

  /* Pointer: hover to preview */
  let hoverTimer;
  links.forEach((link) => {
    link.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch' || touchLayout.matches) return;
      hero.classList.add('is-hovering');
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => activate(link), 80);
    });
    link.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'touch' || touchLayout.matches) return;
      clearTimeout(hoverTimer);
      hero.classList.remove('is-hovering');
    });
    link.addEventListener('focus', () => { if (!touchLayout.matches) activate(link); });
  });

  /* Touch: the list cycles by itself; first tap selects, second tap opens */
  let cycleIndex = -1; // -1 is the reel
  let cycleTimer;
  const cycle = () => {
    clearInterval(cycleTimer);
    if (!touchLayout.matches || reduced || !links.length) return;
    cycleTimer = setInterval(() => {
      if (!inView || document.hidden) return;
      cycleIndex = cycleIndex + 1 >= links.length ? -1 : cycleIndex + 1;
      if (cycleIndex === -1) { links.forEach((l) => l.classList.remove('is-active')); show(reel, 'up'); }
      else activate(links[cycleIndex]);
    }, 6500);
  };
  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (!touchLayout.matches || link.classList.contains('is-active')) return;
      event.preventDefault();
      event.stopPropagation();
      cycleIndex = index;
      activate(link);
      cycle();
    }, true);
  });
  touchLayout.addEventListener('change', cycle);
  cycle();

  /* Pause footage when the hero is scrolled away */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      $$('video', stack).forEach((v) => (inView ? v.play().catch(() => {}) : v.pause()));
    }, { threshold: 0.05 }).observe(hero);
  }

  /* Mouse parallax + a slow idle drift on the scattered titles */
  if (finePointer && !reduced) {
    let tx = 0, ty = 0, x = 0, y = 0;
    hero.addEventListener('pointermove', (event) => {
      tx = (event.clientX / window.innerWidth) * 2 - 1;
      ty = (event.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    const depths = items.map((el) => Number(getComputedStyle(el).getPropertyValue('--depth')) || 0.6);

    ticker.add((time) => {
      if (!inView || touchLayout.matches) return;
      x = lerp(x, tx, 0.06);
      y = lerp(y, ty, 0.06);
      items.forEach((el, i) => {
        const d = depths[i];
        const driftX = Math.sin(time / 2600 + i * 1.7) * 5 * d;
        const driftY = Math.cos(time / 3100 + i * 2.3) * 6 * d;
        el.style.setProperty('--px', `${(-x * 22 * d + driftX).toFixed(2)}px`);
        el.style.setProperty('--py', `${(-y * 16 * d + driftY).toFixed(2)}px`);
      });
      title.style.setProperty('--px', `${(x * 8).toFixed(2)}px`);
      title.style.setProperty('--py', `${(y * 6).toFixed(2)}px`);
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

/* --------------------------------------------------------- services preview ---- */

function initServicePreview() {
  const list = $('[data-svc-list]');
  const preview = $('[data-svc-preview]');
  if (!list || !preview || !finePointer) return;
  const img = $('img', preview);
  let tx = 0, ty = 0, x = 0, y = 0, on = false;

  list.addEventListener('pointermove', (event) => {
    const w = preview.offsetWidth;
    const h = preview.offsetHeight;
    tx = clamp(event.clientX + 28, 12, window.innerWidth - w - 12);
    ty = clamp(event.clientY - h / 2, 12, window.innerHeight - h - 12);
    if (!on) { x = tx; y = ty; }
  }, { passive: true });

  $$('.svc__link', list).forEach((link) => {
    link.addEventListener('pointerenter', () => {
      const src = link.dataset.preview;
      if (!src) { preview.classList.remove('is-on'); on = false; return; }
      if (img.getAttribute('src') !== src) img.src = src;
      preview.classList.add('is-on');
      on = true;
    });
  });
  list.addEventListener('pointerleave', () => { preview.classList.remove('is-on'); on = false; });

  ticker.add(() => {
    x = lerp(x, tx, 0.14);
    y = lerp(y, ty, 0.14);
    preview.style.setProperty('--x', `${x.toFixed(1)}px`);
    preview.style.setProperty('--y', `${y.toFixed(1)}px`);
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
