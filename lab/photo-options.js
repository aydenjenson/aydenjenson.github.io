// Options for showing photography (revision A6). Preview only.
// Returns the pages to add to the lab build; lab/pages.js calls this.
// Four ways to lay out the Photography page, three ways to lead to it from the
// home page, and an index that lists them all with their codes.
import { esc, html } from '../src/lib/html.js';
import { picture, ARROW } from '../src/pages/components.js';
import { labPage } from './shared.js';

const STYLES = ['/lab-assets/photo-options.css'];
const SCRIPTS = ['/lab-assets/photo-options.js'];
const ORDER = ['people', 'events', 'brand'];
// ARROW is the site's drawn arrow. Typed arrow characters are not used anywhere (Ayden wants no emoji, and phones can turn a typed arrow into one).

/** Only the three types he has chosen, in his order, each with its photos. */
function groupsOf(ctx) {
  return ctx.photoCategories
    .filter((c) => c.tab !== false && ORDER.includes(c.folder))
    .sort((a, b) => ORDER.indexOf(a.folder) - ORDER.indexOf(b.folder))
    .map((c) => ({
      folder: c.folder,
      label: c.label,
      photos: ctx.photos
        .filter((p) => p.category === c.folder)
        .map((p) => ({ ...p, sources: [...p.sources].sort((a, b) => a.width - b.width) })),
    }))
    .filter((g) => g.photos.length);
}

const ratio = (img) => img.width / img.height;
const smallest = (img) => (img.sources[0] ? img.sources[0].src : img.src);
/** A file big enough to fill most screens without being the biggest one. */
const medium = (img) => (img.sources.find((s) => s.width >= 1500) || img.sources[img.sources.length - 1] || img).src;

const bar = (code, name) => html`
  <div class="po-bar">
    <p class="po-bar__code"><b>${esc(code)}</b><span>${esc(name)}</span></p>
    <a class="po-bar__back" href="/lab/photos/">All photo options</a>
  </div>`;

/** Attributes that make a link open the lightbox. */
const lbAttrs = (img, set) => `data-lb data-set="${esc(set)}" data-full="${esc(img.full.src)}" data-alt="${esc(img.alt)}" data-label="${esc(img.categoryLabel)}"`;

/* ------------------------------------------------------------------ A6 page 1 */

function chapters(groups) {
  let n = 0;
  const content = html`
<div class="po po-ch">
  ${bar('A6 page: option 1', 'Chapters')}
  <nav class="po-ch__jump" aria-label="Chapters">
    ${groups.map((g) => html`<a href="#ch-${esc(g.folder)}">${esc(g.label)}</a>`)}
  </nav>
  ${groups.map((g) => html`
  <section class="po-ch__chap" id="ch-${esc(g.folder)}" aria-labelledby="ch-${esc(g.folder)}-t">
    <div class="po-ch__side">
      <p class="po-label">Photo</p>
      <h2 class="po-ch__name" id="ch-${esc(g.folder)}-t">${esc(g.label)}</h2>
    </div>
    <ul class="po-ch__rows">
      ${g.photos.map((img) => {
        n += 1;
        return html`<li style="--ar:${ratio(img).toFixed(4)}"><a href="${esc(img.full.src)}" ${lbAttrs(img, g.folder)} aria-label="Open larger: ${esc(img.alt)}">${picture(img, { alt: img.alt, sizes: '(min-width: 900px) 46vw, 96vw', lazy: n > 2 })}</a></li>`;
      })}
      <li class="po-ch__ghost" aria-hidden="true"></li>
    </ul>
  </section>`)}
</div>`;
  return labPage({ path: '/lab/photos/page-1/', title: 'A6 page option 1: Chapters', styles: STYLES, scripts: SCRIPTS, footer: false, content });
}

/* ------------------------------------------------------------------ A6 page 2 */

function sheet(groups) {
  const first = groups[0].photos[0];
  const content = html`
<div class="po po-cs" data-sheet>
  ${bar('A6 page: option 2', 'Contact sheet and viewer')}
  <div class="po-cs__grid">
    <div class="po-cs__viewer">
      <button class="po-cs__stage" type="button" data-sheet-stage aria-label="Open this photo larger. ${esc(first.alt)}">
        <img data-sheet-img src="${esc(medium(first))}" alt="${esc(first.alt)}" width="${first.width}" height="${first.height}" fetchpriority="high" decoding="async">
      </button>
      <p class="po-cs__cap"><span class="po-label" data-sheet-type>${esc(first.categoryLabel)}</span><span data-sheet-alt>${esc(first.alt)}</span></p>
    </div>
    <div class="po-cs__sheet" role="group" aria-label="Contact sheet. Arrow keys step through the photos.">
      ${groups.map((g, gi) => html`
      <section class="po-cs__group" aria-label="${esc(g.label)}">
        <h2 class="po-label">${esc(g.label)}</h2>
        <ul class="po-cs__frames">
          ${g.photos.map((img, k) => html`
          <li><button class="po-cs__frame${gi === 0 && k === 0 ? ' is-on' : ''}" type="button" data-sheet-frame
            data-src="${esc(medium(img))}" data-full="${esc(img.full.src)}" data-alt="${esc(img.alt)}" data-type="${esc(g.label)}" data-w="${img.width}" data-h="${img.height}"
            aria-label="${esc(img.alt)}"${gi === 0 && k === 0 ? ' aria-current="true"' : ''}>
            <img src="${esc(smallest(img))}" alt="" width="${img.width}" height="${img.height}" loading="lazy" decoding="async">
          </button></li>`)}
        </ul>
      </section>`)}
    </div>
  </div>
</div>`;
  return labPage({ path: '/lab/photos/page-2/', title: 'A6 page option 2: Contact sheet and viewer', styles: STYLES, scripts: SCRIPTS, footer: false, content });
}

/* ------------------------------------------------------------------ A6 page 3 */

function strips(groups) {
  let n = 0;
  const content = html`
<div class="po po-st">
  ${bar('A6 page: option 3', 'Strips')}
  <p class="po-st__hint po-label">Drag, swipe or scroll sideways</p>
  ${groups.map((g) => html`
  <section class="po-st__strip" aria-labelledby="st-${esc(g.folder)}-t">
    <div class="po-st__scroll" data-strip tabindex="0" role="region" aria-label="${esc(g.label)} photos. Use the arrow keys to scroll sideways.">
      <div class="po-st__head">
        <p class="po-label">Photo</p>
        <h2 class="po-st__name" id="st-${esc(g.folder)}-t">${esc(g.label)}</h2>
      </div>
      <ul class="po-st__list">
        ${g.photos.map((img) => {
          n += 1;
          return html`<li style="--ar:${ratio(img).toFixed(4)}"><a href="${esc(img.full.src)}" ${lbAttrs(img, g.folder)} draggable="false" aria-label="Open larger: ${esc(img.alt)}">${picture(img, { alt: img.alt, sizes: '(min-width: 900px) 30vw, 70vw', lazy: n > 3 })}</a></li>`;
        })}
      </ul>
      <span class="po-st__end" aria-hidden="true"></span>
    </div>
  </section>`)}
</div>`;
  return labPage({ path: '/lab/photos/page-3/', title: 'A6 page option 3: Strips', styles: STYLES, scripts: SCRIPTS, footer: false, content });
}

/* ------------------------------------------------------------------ A6 page 4 */

function oneAtATime(groups) {
  const first = groups[0].photos[0];
  const content = html`
<div class="po po-one" data-one>
  ${bar('A6 page: option 4', 'One at a time')}
  <div class="po-one__stage is-out" data-one-stage>
    <div class="po-one__bg" aria-hidden="true"><img data-one-bg src="${esc(medium(first))}" alt="" width="${first.width}" height="${first.height}" decoding="async"></div>
    <img class="po-one__img" data-one-img src="${esc(medium(first))}" alt="${esc(first.alt)}" width="${first.width}" height="${first.height}" fetchpriority="high" decoding="async">
    <button class="po-one__nav po-one__nav--prev" type="button" data-one-prev aria-label="Previous photo">Prev</button>
    <button class="po-one__nav po-one__nav--next" type="button" data-one-next aria-label="Next photo">Next</button>
    <p class="po-one__cap" aria-live="polite"><span class="po-label" data-one-type>${esc(first.categoryLabel)}</span><span data-one-alt>${esc(first.alt)}</span></p>
  </div>
  ${groups.map((g, gi) => html`
  <ul class="po-one__frames" data-one-row aria-label="${esc(g.label)} photos"${gi === 0 ? '' : ' hidden'}>
    ${g.photos.map((img) => html`
    <li><button class="po-one__frame" type="button" data-one-frame data-src="${esc(medium(img))}" data-alt="${esc(img.alt)}" data-type="${esc(g.label)}" data-w="${img.width}" data-h="${img.height}" aria-label="${esc(img.alt)}">
      <img src="${esc(smallest(img))}" alt="" width="${img.width}" height="${img.height}" loading="lazy" decoding="async">
    </button></li>`)}
  </ul>`)}
  <div class="po-one__switch" role="group" aria-label="Type of work">
    ${groups.map((g, gi) => `<button class="po-one__type${gi === 0 ? ' is-on' : ''}" type="button" data-one-type-btn aria-pressed="${gi === 0}">${esc(g.label)}</button>`)}
  </div>
</div>`;
  return labPage({ path: '/lab/photos/page-4/', title: 'A6 page option 4: One at a time', styles: STYLES, scripts: SCRIPTS, footer: false, content });
}

/* ------------------------------------------------------------------ A6 home */

/** Five photos that suit a tall panel (portraits first), so each door has something to cycle. */
const tallest = (g, n = 5) => [...g.photos].sort((a, b) => ratio(a) - ratio(b)).slice(0, n);

function doors(groups) {
  return html`
  <div class="po-doors" data-doors>
    ${groups.map((g, gi) => html`
    <a class="po-door" href="/photography/" data-door aria-label="${esc(g.label)} photography">
      <span class="po-door__imgs" aria-hidden="true">
        ${tallest(g).map((img, k) => picture(img, { alt: '', sizes: '(min-width: 900px) 34vw, 34vw', lazy: !(gi === 0 && k === 0), cls: `po-door__img${k === 0 ? ' is-on' : ''}` }))}
      </span>
      <span class="po-door__text">
        <span class="po-label">Photo</span>
        <span class="po-door__title">${esc(g.label)}<span class="po-door__arrow" aria-hidden="true">${ARROW}</span></span>
      </span>
    </a>`)}
  </div>`;
}

/** One photo per type, the one closest to a 3:2 frame. */
const typical = (g) => [...g.photos].sort((a, b) => Math.abs(ratio(a) - 1.5) - Math.abs(ratio(b) - 1.5))[0];

function feature(groups) {
  const picks = groups.map(typical);
  return html`
  <div class="po-feat" data-feature>
    <div class="po-feat__frame">
      ${picks.map((img, k) => picture(img, { alt: `${groups[k].label}: ${img.alt}`, sizes: '(min-width: 900px) 56vw, 100vw', lazy: true, cls: 'po-feat__pic' }).replace('<img', '<img data-feature-pic'))}
    </div>
    <div class="po-feat__list">
      <p class="po-label">Photo</p>
      <ul>
        ${groups.map((g) => html`<li><a class="po-feat__name" href="/photography/" data-feature-name>${esc(g.label)}<span aria-hidden="true">${ARROW}</span></a></li>`)}
      </ul>
    </div>
  </div>`;
}

/** Slots for the collage, as percentages of the block (left, top, width), for a wide and a narrow shape. */
const SLOTS = {
  wide: { shape: 1.7, max: 56, slots: [[3, 7, 23], [21, 38, 19], [40, 3, 17], [51, 31, 26], [76, 5, 19], [68, 55, 24]] },
  tall: { shape: 0.85, max: 44, slots: [[2, 2, 50], [44, 9, 52], [4, 31, 40], [38, 43, 58], [2, 62, 44], [50, 76, 46]] },
};

function place(img, [l, t, w], { shape, max }) {
  let width = w;
  let h = (width * shape) / ratio(img);
  while (h > max) { width *= 0.92; h = (width * shape) / ratio(img); }
  const top = Math.max(0, Math.min(t, 100 - h));
  const left = Math.max(0, Math.min(l, 100 - width));
  return { l: left.toFixed(2), t: top.toFixed(2), w: width.toFixed(2) };
}

/** Two photos per type: the first, and the one whose shape differs most from it. */
function pairOf(g) {
  const [a, ...rest] = g.photos;
  if (!rest.length) return [a];
  const b = [...rest].sort((x, y) => Math.abs(ratio(y) - ratio(a)) - Math.abs(ratio(x) - ratio(a)))[0];
  return [a, b];
}

function collage(groups) {
  const pairs = groups.map(pairOf);
  const mixed = [];
  for (let k = 0; k < 2; k += 1) pairs.forEach((p) => { if (p[k]) mixed.push(p[k]); });
  const speeds = [0.05, -0.04, 0.06, -0.05, 0.04, -0.06];
  return html`
  <div class="po-col">
    <div class="po-col__board">
      ${mixed.map((img, k) => {
        const d = place(img, SLOTS.wide.slots[k], SLOTS.wide);
        const m = place(img, SLOTS.tall.slots[k], SLOTS.tall);
        return html`<div class="po-col__item" data-parallax="${speeds[k]}" style="--l:${d.l}%;--t:${d.t}%;--w:${d.w}%;--ml:${m.l}%;--mt:${m.t}%;--mw:${m.w}%;--z:${(k % 3) + 1}">
          ${picture(img, { alt: img.alt, sizes: '(min-width: 900px) 24vw, 52vw', lazy: true })}
        </div>`;
      })}
    </div>
    <div class="po-col__foot">
      <p class="po-label">Photo</p>
      <a class="po-col__link" href="/photography/">Photography<span aria-hidden="true">${ARROW}</span></a>
    </div>
  </div>`;
}

function homePage(groups) {
  const block = (id, code, name, inner) => html`
<section class="po-home" id="${id}" aria-labelledby="${id}-t">
  <p class="po-home__tag po-label" id="${id}-t"><b>${esc(code)}</b><span>${esc(name)}</span></p>
  <div class="po-home__block">${inner}</div>
</section>`;
  const content = html`
<div class="po po-homes">
  ${bar('A6 home', 'Three ways to lead to the photography page')}
  ${block('home-1', 'A6 home: option 1', 'Three doors', doors(groups))}
  ${block('home-2', 'A6 home: option 2', 'Feature and list', feature(groups))}
  ${block('home-3', 'A6 home: option 3', 'Collage', collage(groups))}
</div>`;
  return labPage({ path: '/lab/photos/home/', title: 'A6 home options', styles: STYLES, scripts: SCRIPTS, footer: false, content });
}

/* ------------------------------------------------------------------ index */

function indexPage() {
  const items = [
    ['A6 page: option 1', 'Chapters', 'One long page in three chapters. The type name stays pinned at the left while its photos scroll past in full-width rows.', '/lab/photos/page-1/'],
    ['A6 page: option 2', 'Contact sheet and viewer', 'One big picture, with small frames in three groups like a contact sheet. Pick a frame or use the arrow keys.', '/lab/photos/page-2/'],
    ['A6 page: option 3', 'Strips', 'Three sideways strips, one per type, that you drag or scroll. Every photo keeps its shape.', '/lab/photos/page-3/'],
    ['A6 page: option 4', 'One at a time', 'One photo fills the screen like your Video page, with the type names as a switch and a row of small frames.', '/lab/photos/page-4/'],
    ['A6 home: option 1', 'Three doors', 'Three tall panels on the home page, one per type, each slowly changing photos.', '/lab/photos/home/#home-1'],
    ['A6 home: option 2', 'Feature and list', 'One large photo with the three type names beside it. Point at a name and the photo changes.', '/lab/photos/home/#home-2'],
    ['A6 home: option 3', 'Collage', 'Six photos of mixed types overlapping like an editorial spread, with one link to the page.', '/lab/photos/home/#home-3'],
  ];
  const content = html`
<div class="po po-index">
  <header class="page-head">
    <p class="label">Preview only. Nothing on this page is on your live site.</p>
    <h1 class="page-title">Photography options</h1>
  </header>
  <ol class="po-index__list">
    ${items.map(([code, name, line, href]) => html`
    <li class="po-index__item">
      <p class="po-index__code po-label">${esc(code)}</p>
      <h2 class="po-index__name">${esc(name)}</h2>
      <p class="po-index__line">${esc(line)}</p>
      <a class="po-index__open" href="${href}">Open full size<span aria-hidden="true">${ARROW}</span></a>
    </li>`)}
  </ol>
  <p class="po-index__note">The design you have now is at <a href="/photography/">/photography/</a> and, on the home page, in the photo strip. Tell me the code you like, for example "A6 page: option 2" and "A6 home: option 1".</p>
</div>`;
  return labPage({ path: '/lab/photos/', title: 'Photography options | Preview only', styles: STYLES, scripts: SCRIPTS, footer: false, content });
}

export function photoOptionPages(ctx) {
  const groups = groupsOf(ctx);
  if (!groups.length) return [];
  return [indexPage(), chapters(groups), sheet(groups), strips(groups), oneAtATime(groups), homePage(groups)];
}
