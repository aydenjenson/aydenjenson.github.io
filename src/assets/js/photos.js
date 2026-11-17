// Photography page: balanced columns that drift at different speeds while
// scrolling, category filters, and a full-screen viewer (keys, swipe, buttons).
import { $, $$, lerp, pad2, reduced, ticker } from './util.js';

export default function initPhotos() {
  const grid = $('[data-photos-grid]');
  if (!grid) return;
  const items = $$('[data-photo]', grid);
  const filters = $$('[data-filter]');
  let filter = 'all';
  let cols = [];

  const visibleItems = () => items.filter((el) => filter === 'all' || el.dataset.category === filter);
  const columnCount = () => (window.innerWidth >= 1100 ? 3 : window.innerWidth >= 640 ? 2 : 1);

  /* Reveal each photo as it scrolls in */
  const io = 'IntersectionObserver' in window && !reduced
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 })
    : null;

  /** Deal the photos into columns, always adding to the shortest one. */
  function layout() {
    const count = columnCount();
    grid.textContent = '';
    grid.classList.add('is-cols');
    cols = Array.from({ length: count }, () => {
      const el = document.createElement('div');
      el.className = 'photos__col';
      grid.append(el);
      return { el, height: 0, y: 0 };
    });
    visibleItems().forEach((item) => {
      const ratio = Number(item.style.getPropertyValue('--ar')) || 1.5;
      const col = cols.reduce((a, b) => (b.height < a.height ? b : a));
      col.el.append(item);
      col.height += 1 / ratio + 0.03;
      if (io) io.observe(item); else item.classList.add('is-in');
    });
  }

  let lastCount = columnCount();
  window.addEventListener('resize', () => {
    if (columnCount() !== lastCount) { lastCount = columnCount(); layout(); }
  });
  layout();

  /* Filters */
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.filter === filter) return;
      filter = button.dataset.filter;
      filters.forEach((b) => {
        const on = b === button;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      grid.classList.add('is-switching');
      setTimeout(() => {
        items.forEach((item) => item.classList.remove('is-in'));
        layout();
        grid.classList.remove('is-switching');
      }, reduced ? 0 : 320);
    });
  });

  /* Columns move at slightly different speeds */
  if (!reduced) {
    const speeds = [0.035, -0.045, 0.02];
    ticker.add(() => {
      if (cols.length < 2) { cols.forEach((c) => { if (c.y) { c.y = 0; c.el.style.transform = ''; } }); return; }
      const rect = grid.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const offset = rect.top - window.innerHeight * 0.5;
      cols.forEach((c, i) => {
        c.y = lerp(c.y, offset * speeds[i % speeds.length], 0.1);
        c.el.style.transform = `translate3d(0, ${c.y.toFixed(2)}px, 0)`;
      });
    });
  }

  initLightbox(items, visibleItems);
}

function initLightbox(items, visibleItems) {
  const box = $('[data-lightbox]');
  if (!box) return;
  const img = $('[data-lb-img]', box);
  const count = $('[data-lb-count]', box);
  const caption = $('[data-lb-caption]', box);
  const closeBtn = $('[data-lb-close]', box);
  let list = [];
  let index = 0;
  let opener = null;
  let token = 0;

  /** Pick the smallest file that still fills this screen. */
  function bestSource(item) {
    const thumb = $('img', item);
    const need = Math.min(window.innerWidth, 1800) * Math.min(window.devicePixelRatio || 1, 2);
    const options = (thumb.getAttribute('srcset') || '').split(',')
      .map((part) => part.trim().split(/\s+/))
      .filter((part) => part.length === 2)
      .map(([src, w]) => ({ src, w: parseInt(w, 10) }))
      .sort((a, b) => a.w - b.w);
    const match = options.find((o) => o.w >= need);
    return match ? match.src : item.getAttribute('href');
  }

  function show() {
    const item = list[index];
    if (!item) return;
    const src = bestSource(item);
    const mine = ++token;
    box.classList.add('is-loading');
    const loader = new Image();
    loader.onload = loader.onerror = () => {
      if (mine !== token) return;
      img.src = src;
      img.alt = $('img', item).alt;
      box.classList.remove('is-loading');
    };
    loader.src = src;
    count.textContent = `${pad2(index + 1)} / ${pad2(list.length)}`;
    caption.textContent = item.dataset.label || '';
    // Warm up the neighbours so stepping through feels instant.
    [list[index + 1], list[index - 1]].forEach((n) => { if (n) new Image().src = bestSource(n); });
  }

  function open(item) {
    list = visibleItems();
    index = Math.max(0, list.indexOf(item));
    opener = item;
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
    setTimeout(() => { box.hidden = true; img.removeAttribute('src'); }, 460);
    if (opener) opener.focus({ preventScroll: true });
  }

  const step = (delta) => { index = (index + delta + list.length) % list.length; show(); };

  items.forEach((item) => item.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return; // let people open the file in a new tab
    event.preventDefault();
    open(item);
  }));
  closeBtn.addEventListener('click', close);
  $('[data-lb-prev]', box).addEventListener('click', () => step(-1));
  $('[data-lb-next]', box).addEventListener('click', () => step(1));
  box.addEventListener('click', (event) => { if (event.target === box || event.target.classList.contains('lightbox__fig')) close(); });

  document.addEventListener('keydown', (event) => {
    if (box.hidden) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowRight') step(1);
    else if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'Tab') {
      // Keep keyboard focus inside the viewer.
      const buttons = $$('button', box);
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  let startX = null;
  box.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (event) => {
    if (startX === null) return;
    const dx = event.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  }, { passive: true });
}
