// Work page. Two layouts over the same list of projects:
//   "wall"   three columns that scroll forever in alternating directions.
//            Wheel / trackpad / arrow keys push them; they drift on their own.
//   "index"  a plain list (always used on phones and touch screens).
// The choice is remembered for the rest of the visit.
import { $, $$, reduced, ticker } from './util.js';

const html = document.documentElement;

export default function initWork() {
  const root = $('[data-work]');
  const wall = $('[data-wall]');
  if (!root || !wall) return;
  const buttons = $$('[data-view]', root);
  const wide = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  let mode = null;
  let stopWall = null;

  const saved = () => { try { return sessionStorage.getItem('aj-work'); } catch { return null; } };

  function setMode(wanted, remember = false) {
    // The wall needs a wide screen and a mouse; everything else gets the index.
    const next = wide.matches && wanted !== 'index' ? 'wall' : 'index';
    if (remember) { try { sessionStorage.setItem('aj-work', next); } catch { /* ignore */ } }
    if (next === mode) return;
    mode = next;
    html.dataset.work = next;
    buttons.forEach((b) => {
      const on = b.dataset.view === next;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (stopWall) { stopWall(); stopWall = null; }
    if (next === 'wall') stopWall = startWall(wall);
    else window.scrollTo(0, 0);
  }

  const views = $('.work__views', root);
  const sync = () => {
    if (views) views.hidden = !wide.matches; // the toggle only makes sense where the wall exists
    setMode(saved() || 'wall');
  };
  buttons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.view, true)));
  wide.addEventListener('change', sync);
  sync();
}

function startWall(wall) {
  const cols = $$('[data-wall-col]', wall).map((col, i) => ({
    col,
    track: $('[data-wall-track]', col),
    dir: i % 2 === 0 ? 1 : -1,
    drift: [0.34, 0.24, 0.4][i % 3],
    y: 0,
    height: 0,
  }));
  let velocity = 0;
  let hovering = false;
  let resizeTimer;

  function build() {
    const vh = window.innerHeight;
    cols.forEach((c) => {
      $$('[data-clone]', c.track).forEach((el) => el.remove());
      c.track.style.transform = '';
      const originals = [...c.track.children];
      originals.forEach((li) => $$('img', li).forEach((img) => { img.loading = 'eager'; }));
      c.height = c.track.offsetHeight;
      if (!c.height) return;
      const copies = Math.ceil((vh * 1.2) / c.height) + 1;
      for (let n = 0; n < copies; n += 1) {
        originals.forEach((li) => {
          const clone = li.cloneNode(true);
          clone.dataset.clone = '';
          clone.setAttribute('aria-hidden', 'true');
          $$('a', clone).forEach((a) => { a.tabIndex = -1; });
          c.track.append(clone);
        });
      }
      // Start each column at a different point so the rows don't line up.
      c.y = (c.height * [0.08, 0.46, 0.27][cols.indexOf(c) % 3]) % c.height;
    });
  }

  const onWheel = (event) => { velocity += event.deltaY * 0.32; };
  const onKey = (event) => {
    const step = { ArrowDown: 160, ArrowUp: -160, PageDown: 520, PageUp: -520, ' ': 520 }[event.key];
    if (!step || event.target.closest('button, input, textarea')) return;
    velocity += step * 0.16;
    event.preventDefault();
  };
  const onOver = (event) => {
    hovering = Boolean(event.target.closest && event.target.closest('.tile__link'));
    wall.classList.toggle('is-hovering', hovering);
  };
  const onLeave = () => { hovering = false; wall.classList.remove('is-hovering'); };
  const onFocus = (event) => {
    // Keyboard focus: bring the focused tile into view instead of letting the browser scroll the column.
    const li = event.target.closest && event.target.closest('.tile');
    const c = li && cols.find((entry) => entry.track.contains(li));
    if (!c) return;
    c.col.scrollTop = 0;
    c.y = Math.max(0, li.offsetTop - window.innerHeight * 0.3) % c.height;
  };
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 180); };

  // Touch-pad style dragging with a finger or pen, in case the wall is used on a touch laptop.
  let dragY = null;
  const onDown = (event) => { if (event.pointerType !== 'mouse') dragY = event.clientY; };
  const onMove = (event) => {
    if (dragY === null) return;
    velocity += (dragY - event.clientY) * 0.5;
    dragY = event.clientY;
  };
  const onUp = () => { dragY = null; };

  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
  wall.addEventListener('pointerover', onOver, { passive: true });
  wall.addEventListener('pointerleave', onLeave);
  wall.addEventListener('focusin', onFocus);
  wall.addEventListener('pointerdown', onDown, { passive: true });
  wall.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });

  build();
  // Fonts and images can change tile heights slightly once they arrive.
  const settle = setTimeout(build, 1200);

  const stopTicker = ticker.add((_time, dt) => {
    const k = dt / 16.7;
    velocity *= 0.9 ** k;
    if (Math.abs(velocity) < 0.01) velocity = 0;
    const ease = hovering ? 0.12 : 1;
    cols.forEach((c) => {
      if (!c.height) return;
      const drift = reduced ? 0 : c.drift * ease;
      c.y += (drift + velocity * 0.22) * c.dir * k;
      c.y = ((c.y % c.height) + c.height) % c.height;
      c.track.style.transform = `translate3d(0, ${(-c.y).toFixed(2)}px, 0)`;
    });
  });

  return function stop() {
    stopTicker();
    clearTimeout(settle);
    clearTimeout(resizeTimer);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointerup', onUp);
    wall.removeEventListener('pointerover', onOver);
    wall.removeEventListener('pointerleave', onLeave);
    wall.removeEventListener('focusin', onFocus);
    wall.removeEventListener('pointerdown', onDown);
    wall.removeEventListener('pointermove', onMove);
    wall.classList.remove('is-hovering');
    cols.forEach((c) => {
      $$('[data-clone]', c.track).forEach((el) => el.remove());
      c.track.style.transform = '';
      c.col.scrollTop = 0;
    });
  };
}
