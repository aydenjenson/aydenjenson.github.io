// Runs on every page: page transitions, navigation, scroll reveals, parallax
// and preview loops. (There is deliberately no label that follows the
// pointer: Ayden does not want one.) Page-specific code lives in
// home.js, work.js, film.js, photos.js and contact.js and is loaded on demand.
import { $, $$, lerp, clamp, wait, reduced, finePointer, saveData, ticker, playLoop, stopLoop } from './util.js';

const html = document.documentElement;
const page = document.body.dataset.page;
window.__ajReady = true; // tells the safety net in <head> that this script started

/* ---------------------------------------------------------------- boot ---- */

function markSeen() {
  try { sessionStorage.setItem('aj-seen', '1'); } catch { /* private mode */ }
}

function ready() {
  html.classList.add('is-ready');
  markSeen();
  // Once the intro has played, drop its classes so nothing stays layered above the page.
  setTimeout(() => html.classList.remove('first-visit', 'intro-in'), 2400);
}

function boot() {
  const intro = page === 'home' && html.classList.contains('first-visit') && !reduced;
  if (intro) {
    // Name appears letter by letter over black, then the film fades up behind it.
    setTimeout(() => html.classList.add('intro-in'), 60);
    const poster = $('.hero__img');
    const posterLoaded = poster && !poster.complete
      ? new Promise((resolve) => { poster.addEventListener('load', resolve, { once: true }); poster.addEventListener('error', resolve, { once: true }); })
      : Promise.resolve();
    Promise.all([wait(1900), Promise.race([posterLoaded, wait(3200)])]).then(ready);
  } else {
    html.classList.remove('first-visit');
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, wait(500)]).then(ready);
  }
}

// Coming back with the browser's Back button: lift the curtain again.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    html.classList.remove('is-leaving', 'menu-open');
    html.classList.add('is-ready');
  }
});

/* ------------------------------------------------------ page transitions ---- */

function initLinks() {
  const prefetched = new Set();

  const internal = (a) => {
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noTransition !== undefined) return null;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return null;
    if (/\.(jpe?g|png|webp|gif|mp4|pdf)$/i.test(url.pathname)) return null;
    return url;
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const a = event.target.closest('a[href]');
    const url = internal(a);
    if (!url) return;
    // Same page: let the browser handle #anchors (smooth scrolling is in the CSS).
    if (url.pathname === location.pathname && url.search === location.search) {
      if (url.hash === '#main' || !url.hash) { event.preventDefault(); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
      return;
    }
    event.preventDefault();
    html.classList.add('is-leaving');
    setTimeout(() => { location.href = url.href; }, reduced ? 0 : 380);
  });

  // Warm up the next page as soon as the pointer shows intent.
  document.addEventListener('pointerover', (event) => {
    const a = event.target.closest && event.target.closest('a[href]');
    const url = internal(a);
    if (!url || url.pathname === location.pathname || prefetched.has(url.pathname) || saveData) return;
    prefetched.add(url.pathname);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.pathname;
    document.head.append(link);
  }, { passive: true });
}

/* ------------------------------------------------------------ navigation ---- */

function initNav() {
  const nav = $('[data-nav]');
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!nav) return;

  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (!html.classList.contains('menu-open')) {
      if (y > 320 && y > lastY + 6) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 320) nav.classList.remove('is-hidden');
    }
    lastY = y;
  }, { passive: true });

  if (!toggle || !menu) return;
  const setOpen = (open) => {
    html.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('is-hidden');
  };
  toggle.addEventListener('click', () => setOpen(!html.classList.contains('menu-open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && html.classList.contains('menu-open')) { setOpen(false); toggle.focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (mq) => { if (mq.matches) setOpen(false); });
}

/* -------------------------------------------------------- scroll reveals ---- */

function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  if (!('IntersectionObserver' in window) || reduced) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  // A "clip" reveal starts fully clipped, and browsers treat a fully clipped
  // element as not on screen. So for those we watch the parent instead.
  const watched = new Map();
  items.forEach((el) => {
    const watch = el.dataset.reveal === 'clip' && el.parentElement ? el.parentElement : el;
    if (!watched.has(watch)) watched.set(watch, []);
    watched.get(watch).push(el);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      (watched.get(entry.target) || []).forEach((el) => el.classList.add('is-in'));
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.05 });
  watched.forEach((_els, watch) => io.observe(watch));
}

/* ---------------------------------------------------------------- parallax ---- */

function initParallax() {
  const items = $$('[data-parallax]').map((el) => ({ el, speed: Number(el.dataset.parallax) || 0, y: 0, visible: false }));
  if (!items.length || reduced || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const item = items.find((i) => i.el === entry.target);
      if (item) item.visible = entry.isIntersecting;
    });
  }, { rootMargin: '25% 0px 25% 0px' });
  items.forEach((item) => io.observe(item.el));

  ticker.add(() => {
    const mid = window.innerHeight / 2;
    // Less travel on narrow screens, where columns stack.
    const scale = window.innerWidth < 900 ? 0.45 : 1;
    for (const item of items) {
      if (!item.visible) continue;
      const rect = item.el.getBoundingClientRect();
      const natural = rect.top - item.y + rect.height / 2; // centre without our own offset
      const target = (natural - mid) * item.speed * scale;
      item.y = lerp(item.y, target, 0.12);
      item.el.style.transform = `translate3d(0, ${item.y.toFixed(2)}px, 0)`;
    }
  });
}

/* ------------------------------------------------------------ preview loops ---- */

function initLoops() {
  // "view" loops play while they are on screen.
  const viewLoops = $$('video[data-loop-video="view"]');
  if (viewLoops.length && 'IntersectionObserver' in window && !reduced && !saveData) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? playLoop(entry.target) : stopLoop(entry.target)));
    }, { threshold: 0.35 });
    viewLoops.forEach((v) => io.observe(v));
  }

  // "hover" loops play while the pointer (or keyboard focus) is on their link.
  if (saveData) return;
  const loopIn = (target) => target && target.closest && target.closest('a') && $('video[data-loop-video="hover"]', target.closest('a'));
  let current = null;
  const enter = (event) => {
    const video = loopIn(event.target);
    if (video === current) return;
    if (current) stopLoop(current);
    current = video || null;
    if (video) playLoop(video);
  };
  if (finePointer) document.addEventListener('pointerover', enter, { passive: true });
  document.addEventListener('focusin', enter);
}

/* ---------------------------------------------------- before and after ---- */

// One frame with a line across it: ungraded on the left, graded on the right.
// Press and drag anywhere on the picture to move the line. It never follows
// the pointer by itself. The buttons beside it switch to another frame.
// Markup: gradeSection() in src/pages/components.js.
function initGrade() {
  $$('[data-grade]').forEach((root) => {
    const stage = $('[data-grade-stage]', root);
    const range = $('input[type="range"]', stage);
    const after = $('[data-grade-after]', stage);
    const before = $('[data-grade-before]', stage);
    const picks = $$('[data-grade-pick]', root);
    const link = $('[data-grade-link]', root);
    let touched = false;

    const set = (value) => {
      const split = clamp(value, 0, 100);
      stage.style.setProperty('--split', `${split.toFixed(2)}%`);
      range.value = String(Math.round(split));
    };
    const follow = (event) => {
      const rect = stage.getBoundingClientRect();
      if (rect.width) set(((event.clientX - rect.left) / rect.width) * 100);
    };

    // Sideways drags move the line; up-and-down swipes still scroll the page
    // (touch-action: pan-y in the CSS hands those back to the browser).
    stage.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      touched = true;
      stage.classList.add('is-dragging');
      try { stage.setPointerCapture(event.pointerId); } catch { /* the pointer is already gone */ }
      follow(event);
    });
    stage.addEventListener('pointermove', (event) => { if (stage.classList.contains('is-dragging')) follow(event); });
    const drop = () => stage.classList.remove('is-dragging');
    stage.addEventListener('pointerup', drop);
    stage.addEventListener('pointercancel', drop);
    stage.addEventListener('lostpointercapture', drop);
    stage.addEventListener('dragstart', (event) => event.preventDefault());
    // Keyboard: Tab to the picture, then the arrow keys.
    range.addEventListener('input', () => { touched = true; stage.style.setProperty('--split', `${range.value}%`); });

    // The first time the picture comes into view the line sways once, to show it can be moved.
    if (!reduced && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let start = 0;
        const sway = (now) => {
          if (touched) return;
          if (!start) start = now;
          const t = Math.min(1, (now - start) / 1900);
          set(50 + Math.sin(t * Math.PI * 2) * 13 * (1 - t * 0.35));
          if (t < 1) requestAnimationFrame(sway);
          else set(50);
        };
        setTimeout(() => requestAnimationFrame(sway), 700);
      }, { threshold: 0.55 });
      io.observe(stage);
    }

    // Another frame: both pictures are fetched first, then swapped together.
    const fetched = new Map();
    const fetchImage = (src) => {
      if (!fetched.has(src)) {
        fetched.set(src, new Promise((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => resolve();
          img.src = src;
        }));
      }
      return fetched.get(src);
    };
    let current = picks.find((b) => b.classList.contains('is-active')) || null;
    const show = (button) => {
      if (button === current) return;
      current = button;
      const d = button.dataset;
      picks.forEach((b) => {
        b.classList.toggle('is-active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      if (link) {
        link.hidden = !d.href;
        if (d.href) link.href = d.href;
      }
      stage.classList.add('is-loading');
      Promise.all([fetchImage(d.after), fetchImage(d.before)]).then(() => {
        if (current !== button) return; // another frame was chosen while this one loaded
        after.src = d.after;
        after.alt = d.alt || '';
        before.src = d.before;
        stage.classList.remove('is-loading');
      });
    };
    picks.forEach((button) => {
      button.addEventListener('click', () => show(button));
      // Start fetching as soon as the pointer or the keyboard reaches a button.
      const warm = () => { if (!saveData) { fetchImage(button.dataset.after); fetchImage(button.dataset.before); } };
      button.addEventListener('pointerenter', warm);
      button.addEventListener('focus', warm);
    });
  });
}

/* ------------------------------------------------------------------- start ---- */

const modules = {
  home: () => import('./home.js'),
  work: () => import('./work.js'),
  film: () => import('./film.js'),
  photography: () => import('./photos.js'),
  contact: () => import('./contact.js'),
};

initLinks();
initNav();
initReveal();
initParallax();
initLoops();
initGrade();
boot();

if (modules[page]) {
  modules[page]()
    .then((mod) => mod.default && mod.default())
    .catch((error) => console.error('Page script failed to load', error));
}
