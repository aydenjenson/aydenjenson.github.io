// Design options ("the lab").
//
// Ayden does not build websites, so describing a design choice in words does
// not help him much. These pages SHOW the choices instead, using his own
// footage, and give every choice a short code (A3, C2 ...) he can answer with.
//
// They exist only in the local preview: `node dev.js` builds with `--lab`,
// a normal `node build.js` (and so the published site) leaves them out.
//
//   /lab/                      the options page
//   /lab/work-grid/            Work page layouts, shown inside the options page
//   /lab/work-list/            and also open-able on their own at full size
//   /lab/work-strip/
//   /lab/work-scroll/
//   /lab/project-in-depth/     a longer project page
//
// When Ayden picks an option, build it into src/ properly and remove it here.
// Styles: lab/assets/lab.css. Behaviour: lab/assets/lab.js.
import { esc, html, pad2, clock, plain } from '../src/lib/html.js';
import { chars, spread, titleText, projectAttrs, posterImg, loopVideo } from '../src/pages/components.js';

// Free fonts from Google Fonts, loaded on these pages only. (Instrument Serif
// and Inter Tight are already part of the site.) If one is chosen it gets
// downloaded into src/assets/fonts like the others.
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bodoni+Moda:opsz,wght@6..96,400&family=Cormorant+Garamond:wght@500&family=Fraunces:opsz,wght@9..144,300&family=Playfair+Display:wght@400&family=Syne:wght@700&display=swap';

/** A. Fonts for the name on the home screen. `fit` trims fonts that look bigger than the rest at the same width. */
const NAME_FONTS = [
  { code: 'A1', label: 'Instrument Serif', note: 'What the site uses now.', family: "'Instrument Serif'", weight: 400, style: 'normal', caps: false, tracking: '0', fit: 1 },
  { code: 'A2', label: 'Instrument Serif Italic', note: 'The same font, slanted. Softer and more personal.', family: "'Instrument Serif'", weight: 400, style: 'italic', caps: false, tracking: '0', fit: 1 },
  { code: 'A3', label: 'Cormorant Garamond', note: 'Lighter and more classic, like an old film title.', family: "'Cormorant Garamond'", weight: 500, style: 'normal', caps: false, tracking: '0', fit: 1 },
  { code: 'A4', label: 'Playfair Display', note: 'Stronger thick and thin strokes. More formal.', family: "'Playfair Display'", weight: 400, style: 'normal', caps: false, tracking: '0', fit: 1 },
  { code: 'A5', label: 'Fraunces', note: 'Rounder and warmer, a little vintage.', family: "'Fraunces'", weight: 300, style: 'normal', caps: false, tracking: '-0.01em', fit: 1 },
  { code: 'A6', label: 'Bodoni Moda', note: 'Very high contrast, like a fashion magazine.', family: "'Bodoni Moda'", weight: 400, style: 'normal', caps: false, tracking: '0', fit: 1 },
  { code: 'A7', label: 'Inter Tight, capitals', note: 'The plain font the menu uses, in capitals. Clean and modern.', family: "'Inter Tight'", weight: 600, style: 'normal', caps: true, tracking: '-0.01em', fit: 0.9 },
  { code: 'A8', label: 'Bebas Neue', note: 'Tall poster capitals. The loudest one.', family: "'Bebas Neue'", weight: 400, style: 'normal', caps: true, tracking: '0.02em', fit: 0.78 },
  { code: 'A9', label: 'Syne', note: 'Wide and bold. The most modern of the nine.', family: "'Syne'", weight: 700, style: 'normal', caps: false, tracking: '-0.02em', fit: 0.95 },
];

/** B. The small line under the name. */
const NAME_LINES = [
  { code: 'B1', label: 'Cinematographer / Mankato, MN', parts: ['Cinematographer', 'Mankato, MN'], note: 'What the site uses now. One line, stretched to exactly the width of your name.' },
  { code: 'B2', label: 'Cinematographer', parts: ['Cinematographer'], note: 'One word with wide spacing. Mankato would move to a corner of the screen.' },
  { code: 'B3', label: 'Videographer & Cinematographer', parts: ['Videographer & Cinematographer'], note: 'Both words, still the width of your name, with the letters closer together.' },
  { code: 'B4', label: 'Nothing', parts: [], note: "Just your name, the way Xanvier's home screen does it. Your role and city would sit in a corner." },
];

/** C. Layouts for the Work page. */
const WORK_OPTIONS = [
  { code: 'C1', label: 'Wall', src: '/work/', note: 'What the site uses now. Three columns that drift in opposite directions. Point at a frame to play it.' },
  { code: 'C2', label: 'Grid', src: '/lab/work-grid/', note: 'Every project the same size, three across. Pointing at one plays it and shows its title inside the frame. The calmest option and the quickest to scan.' },
  { code: 'C3', label: 'List', src: '/lab/work-list/', note: 'Big titles in a list. Point at a title and its footage plays in one fixed window on the right. The window stays put; nothing follows the mouse.' },
  { code: 'C4', label: 'Filmstrip', src: '/lab/work-strip/', note: 'One long row. Scrolling down pulls the row sideways, like a strip of film. Vertical videos keep their tall shape.' },
  { code: 'C5', label: 'One at a time', src: '/lab/work-scroll/', note: "Borrowed from Kai Blamey's site. One project fills the screen. Scrolling steps through the titles and the film behind them changes. The most cinematic, and the slowest to browse." },
];

/** E. How much a project page holds. */
const PROJECT_OPTIONS = [
  { code: 'E1', label: 'As it is now', src: '/work/scheels-turkey-hunting/', note: 'The film fills the screen. Scroll down for one paragraph and the details.' },
  { code: 'E2', label: 'In depth', src: '/lab/project-in-depth/', note: "Modelled on Danik Bartolini's project pages. The details stay on the left while you scroll past the film, frames from it, other cuts and behind-the-scenes photos. The grey boxes mark things I would need from you." },
];

/** F. Sentences for the top of the home page. All of them only say things that are already true on the site. */
const SENTENCES = [
  { code: 'F1', text: "I'm Ayden, a videographer and cinematographer based in Mankato, Minnesota. I make brand films, commercials and social content for businesses that want to look as good as the work they do.", note: 'On the site now.' },
  { code: 'F2', text: 'Brand films, commercials and social media content, made in Mankato, Minnesota and wherever the work goes.', note: 'Shorter. Leads with the work instead of with you.' },
  { code: 'F3', text: "I'm Ayden Jenson, a cinematographer in Mankato, Minnesota. I help businesses show who they are on camera.", note: 'Plain and direct.' },
  { code: 'F4', text: 'Cinematography for brands with a story worth watching. Based in Mankato, Minnesota. Open to travel.', note: 'Three short beats. The most like a tagline.' },
  { code: 'F5', text: "I'm Ayden. I shoot, edit and color brand films, commercials and social content from Mankato, Minnesota.", note: 'Says you do all three jobs yourself.' },
];

// The stand-in reel on the home page is five clips. Rough start time of each, in seconds.
const REEL_SEGMENTS = [
  { at: 0, label: 'SCHEELS' },
  { at: 3.5, label: 'Reborn Legacy' },
  { at: 7, label: 'Western Fest' },
  { at: 11, label: 'Bison' },
  { at: 14.5, label: 'SCHEELS' },
];

const HEAD = `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONT_URL}">
<link rel="stylesheet" href="/lab-assets/lab.css">`;
const SCRIPT = '<script type="module" src="/lab-assets/lab.js"></script>';

const still = (p) => p.loop?.still || p.poster.src;
const fontStyle = (f) => `font-family:${f.family}, serif;font-weight:${f.weight};font-style:${f.style};text-transform:${f.caps ? 'uppercase' : 'none'};letter-spacing:${f.tracking}`;

/** Every lab page: kept out of search engines, with the lab stylesheet and script. */
function labPage(page) {
  return { id: 'lab', nav: '', noindex: true, description: 'Design options. Local preview only.', head: HEAD, ...page, content: `${page.content}\n${SCRIPT}` };
}

/** A live page in a frame, drawn at desktop size and scaled down to fit (lab.js sets the scale). */
function frame(src, title, name) {
  return html`
  <div class="lab-frame" data-lab-frame="${name}" data-w="1440" data-h="900">
    <iframe src="${esc(src)}" title="${esc(title)}" loading="lazy"></iframe>
  </div>`;
}

function sizeToggle(name) {
  return html`
  <div class="lab-sizes" role="group" aria-label="Preview size">
    <button class="is-active" type="button" data-lab-size="desktop" data-for="${name}">Computer</button>
    <button type="button" data-lab-size="phone" data-for="${name}">Phone</button>
  </div>`;
}

function section({ id, letter, title, lead, body }) {
  return html`
<section class="lab-sec" id="${id}" aria-labelledby="${id}-title">
  <header class="lab-sec__head">
    <p class="lab-sec__letter" aria-hidden="true">${letter}</p>
    <h2 class="section-title" id="${id}-title">${esc(title)}</h2>
    <p class="lab-sec__lead">${lead}</p>
  </header>
  ${body}
</section>`;
}

/* -------------------------------------------------------------------------- */
/* The options page                                                            */
/* -------------------------------------------------------------------------- */

function indexPage(ctx) {
  const { site } = ctx;
  const reel = ctx.projects.find((p) => p.slug === site.home.reelProject) || ctx.projects[0];
  const reelStill = still(reel);
  const reelLoop = reel.loop?.sd || reel.loop?.hd || '';
  const scheels = ctx.projects.find((p) => p.slug === 'scheels-turkey-hunting') || ctx.projects[0];
  const firstBio = site.about.bio[0] || '';

  const nameSection = section({
    id: 'name',
    letter: 'A + B',
    title: 'Your name on the home screen',
    lead: 'The picture below is the real home page. Pick a font (A) and a line to go under it (B) and it changes on the spot. Every font here is free to use.',
    body: html`
  <div class="lab-bar">
    <p class="lab-now" aria-live="polite">Showing <b data-lab-now-font>A1</b> with <b data-lab-now-line>B1</b></p>
    ${sizeToggle('name')}
    <a class="link-arrow hover-blur" href="/" target="_blank" rel="noopener">${chars('Open the home page by itself')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a>
  </div>
  ${frame('/', 'The home page with the chosen font', 'name')}

  <h3 class="lab-sub"><span>A</span> The font</h3>
  <div class="lab-fonts" data-lab-fonts>
    ${NAME_FONTS.map((f, i) => html`
    <button class="lab-font${i === 0 ? ' is-active' : ''}" type="button" data-lab-font="${f.code}" aria-pressed="${i === 0}">
      <span class="lab-font__view">
        <img src="${esc(reelStill)}" alt="" loading="lazy" decoding="async">
        <span class="lab-font__lockup">
          <span class="lab-font__name" style="${fontStyle(f)}" data-fit="${f.fit}">${esc(site.name)}</span>
          <span class="lab-font__role">${spread(NAME_LINES[0].parts)}</span>
        </span>
      </span>
      <span class="lab-opt"><b>${f.code}</b><span>${esc(f.label)}</span><i>${esc(f.note)}</i></span>
    </button>`)}
  </div>

  <h3 class="lab-sub"><span>B</span> The line under it</h3>
  <div class="lab-lines" data-lab-lines>
    ${NAME_LINES.map((l, i) => html`
    <button class="lab-line${i === 0 ? ' is-active' : ''}" type="button" data-lab-line="${l.code}" aria-pressed="${i === 0}">
      <span class="lab-opt"><b>${l.code}</b><span>${esc(l.label)}</span><i>${esc(l.note)}</i></span>
    </button>`)}
  </div>`,
  });

  const workSection = section({
    id: 'work',
    letter: 'C',
    title: 'The Work page',
    lead: 'Five ways to lay out the same projects. Each one is a working page: move your mouse over it and scroll inside it.',
    body: tabs('work', WORK_OPTIONS),
  });

  const ideasSection = section({
    id: 'ideas',
    letter: 'D',
    title: 'Ideas from the other two sites',
    lead: 'Things kaiblamey.com and danikbartolini.com do that your site does not do yet, plus two of my own. Say the codes you like. None of them are built in.',
    body: html`
  <div class="lab-ideas">

    <article class="lab-idea">
      <div class="lab-idea__demo lab-timeline" data-lab-timeline>
        <video class="lab-cover" muted loop playsinline preload="none" data-loop-video="view" data-src="${esc(reelLoop)}" poster="${esc(reelStill)}"></video>
        <div class="lab-timeline__bar">
          ${REEL_SEGMENTS.map((s) => `<button type="button" data-at="${s.at}"><i></i><span>${esc(s.label)}</span></button>`)}
        </div>
      </div>
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D1</b> From Danik Bartolini</p>
        <h3>A timeline over your reel</h3>
        <p>A row of bars across the top of the home screen, one per clip in the reel. The bar for the clip on screen fills up, and its name shows. Click a bar to jump to that clip. It would suit the showreel you plan to cut.</p>
      </div>
    </article>

    <article class="lab-idea">
      <div class="lab-idea__demo lab-giant">
        <img class="lab-cover" src="${esc(reelStill)}" alt="" loading="lazy" decoding="async">
        <p class="lab-giant__name">${esc(site.name)}</p>
        <p class="lab-giant__word">Cinematographer</p>
      </div>
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D2</b> From Danik Bartolini</p>
        <h3>One giant word instead of your name in the middle</h3>
        <p>Your name goes small in the corner and your job title fills the bottom of the screen. Bolder, but there is no room left for the six project titles, so it would replace the Xanvier-style hover.</p>
      </div>
    </article>

    <article class="lab-idea">
      <div class="lab-idea__demo lab-panel">
        <video class="lab-cover" muted loop playsinline preload="none" data-loop-video="view" data-src="${esc(reelLoop)}" poster="${esc(reelStill)}"></video>
        <div class="lab-panel__glass">
          <p class="label">About</p>
          <p>${esc(firstBio.length > 230 ? `${firstBio.slice(0, firstBio.lastIndexOf(' ', 230))} ...` : firstBio)}</p>
          <p class="label">Contact</p>
          <p>${esc(site.contact.email)}</p>
        </div>
      </div>
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D3</b> From Kai Blamey</p>
        <h3>About and Contact as a glass panel over the film</h3>
        <p>Clicking "About" would not leave the page. A frosted panel opens over the reel, which keeps playing behind it. Quick and stylish, but Google reads separate About and Contact pages better, so I would keep those pages and add this on top.</p>
      </div>
    </article>

    <article class="lab-idea">
      <div class="lab-idea__demo lab-bigname">
        <div class="marquee">
          <ul class="marquee__track"><li>${esc(site.name)}</li><li>${esc(site.name)}</li></ul>
          <ul class="marquee__track" aria-hidden="true"><li>${esc(site.name)}</li><li>${esc(site.name)}</li></ul>
        </div>
      </div>
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D4</b> From Danik Bartolini</p>
        <h3>Your name, huge, sliding across the bottom of every page</h3>
        <p>A signature at the very end of each page. Your About page already does this with the names of people you have worked with.</p>
      </div>
    </article>

    <article class="lab-idea">
      <div class="lab-idea__demo lab-compare" data-lab-compare style="--split:50%">
        <img class="lab-cover lab-compare__after" src="/lab-assets/frames/scheels-02.jpg" alt="" loading="lazy" decoding="async">
        <img class="lab-cover lab-compare__before" src="/lab-assets/frames/scheels-02.jpg" alt="" loading="lazy" decoding="async">
        <span class="lab-compare__handle" aria-hidden="true"></span>
        <span class="lab-compare__tag lab-compare__tag--l">Before</span>
        <span class="lab-compare__tag lab-compare__tag--r">After</span>
        <input class="lab-compare__range" type="range" min="0" max="100" value="50" aria-label="Before and after">
      </div>
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D5</b> My suggestion</p>
        <h3>A before and after slider for your color grading</h3>
        <p>Drag the line across a frame to wipe between the footage straight from the camera and your grade. It shows a skill most videographers cannot show. The "before" side here is faked by washing out the picture. The real thing needs the ungraded version of a few frames from you.</p>
      </div>
    </article>

    <article class="lab-idea lab-idea--text">
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D6</b> From Kai Blamey</p>
        <h3>Scroll through titles on the home screen</h3>
        <p>His home screen is option C5 above: one film fills the screen and scrolling moves through the titles. It could replace your home screen instead of your Work page. You would lose the hover effect you asked for, so I would only use it for the Work page.</p>
      </div>
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D7</b> From Kai Blamey</p>
        <h3>Category buttons on the home screen</h3>
        <p>Small buttons at the bottom of the home screen (Brand, Creative) that swap which six titles sit over the reel. Worth it once you have more than six strong projects in each group.</p>
      </div>
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D8</b> From Danik Bartolini</p>
        <h3>Awards on the picture</h3>
        <p>Festival laurels placed over a project's still. Only useful if a film of yours is selected or wins something. Easy to add when that happens.</p>
      </div>
    </article>
  </div>`,
  });

  const projectSection = section({
    id: 'project',
    letter: 'E',
    title: 'How much a project page holds',
    lead: 'You said you want some projects shown in more depth. Here is the page as it is now next to a longer one, both using the SCHEELS spec ad. A project could use either: the short page for small pieces and the long one for your best work.',
    body: tabs('project', PROJECT_OPTIONS),
  });

  const sentenceSection = section({
    id: 'sentence',
    letter: 'F',
    title: 'The sentence under the reel',
    lead: 'You said you want a new one. Here are five starting points. Pick one, mix two, or send me your own words and I will tidy them.',
    body: html`
  <ol class="lab-sentences">
    ${SENTENCES.map((s) => html`
    <li>
      <p class="lab-sentences__text">${esc(s.text)}</p>
      <p class="lab-opt"><b>${s.code}</b><i>${esc(s.note)}</i></p>
    </li>`)}
  </ol>`,
  });

  const content = html`
<div class="lab" data-lab>
  <header class="page-head">
    <p class="label">Preview only. Nothing on this page is on your live site.</p>
    <h1 class="page-title">Design options</h1>
    <p class="page-lead">Every choice has a short code, like A3 or C2. Look through them, then tell me the codes you want and I will build those into the site.</p>
    <nav class="lab-toc" aria-label="Sections">
      ${[['name', 'A + B', 'Your name'], ['work', 'C', 'Work page'], ['ideas', 'D', 'Ideas from the other sites'], ['project', 'E', 'Project pages'], ['sentence', 'F', 'Intro sentence']]
        .map(([id, letter, label]) => `<a class="hover-blur" href="#${id}"><b>${letter}</b>${chars(label)}</a>`)}
    </nav>
  </header>
  ${nameSection}
  ${workSection}
  ${ideasSection}
  ${projectSection}
  ${sentenceSection}
  <p class="lab-end">Want to see something that is not here? Ask. I can add it to this page before building it for real.</p>
</div>
<script type="application/json" id="lab-data">${JSON.stringify({ fonts: NAME_FONTS, lines: NAME_LINES, fontUrl: FONT_URL }).replace(/</g, '\\u003c')}</script>`;

  return labPage({ path: '/lab/', title: 'Design options | Preview only', footer: false, content });
}

/** A row of option buttons that switch one framed page. */
function tabs(name, options) {
  return html`
  <div class="lab-tabs" data-lab-tabs="${name}">
    <div class="lab-tabs__list" role="group" aria-label="Options">
      ${options.map((o, i) => html`
      <button class="lab-tab${i === 0 ? ' is-active' : ''}" type="button" data-lab-tab data-src="${esc(o.src)}" data-note="${esc(o.note)}" aria-pressed="${i === 0}"><b>${o.code}</b> ${esc(o.label)}</button>`)}
    </div>
    <div class="lab-bar">
      <p class="lab-note" data-lab-tab-note aria-live="polite">${esc(options[0].note)}</p>
      ${sizeToggle(name)}
      <a class="link-arrow hover-blur" href="${esc(options[0].src)}" target="_blank" rel="noopener" data-lab-tab-open>${chars('Open it full size')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a>
    </div>
    ${frame(options[0].src, 'Preview of the chosen option', name)}
  </div>`;
}

/* -------------------------------------------------------------------------- */
/* Work page layouts                                                           */
/* -------------------------------------------------------------------------- */

function workHead(ctx, option) {
  const { site } = ctx;
  return html`
  <header class="work__head">
    <p class="label">${option.code} / ${esc(option.label)} / Preview only</p>
    <h1 class="work__title">${esc(site.work.heading)}<sup>${ctx.projects.length}</sup></h1>
    <p class="work__lead">${esc(site.work.lead)}</p>
  </header>`;
}

function categoryFilters(ctx) {
  const cats = ctx.site.work.categories
    .map((c) => ({ ...c, count: ctx.projects.filter((p) => p.category === c.id).length }))
    .filter((c) => c.count);
  return html`
  <div class="filters lab-filters" role="group" aria-label="Filter projects" data-lab-filters>
    <button class="filter is-active" type="button" data-filter="all" aria-pressed="true">All<sup>${ctx.projects.length}</sup></button>
    ${cats.map((c) => `<button class="filter" type="button" data-filter="${esc(c.id)}" aria-pressed="false">${esc(c.label)}<sup>${c.count}</sup></button>`)}
  </div>`;
}

function gridPage(ctx) {
  const option = WORK_OPTIONS[1];
  const content = html`
<section class="work lab-work" data-lab-grid>
  ${workHead(ctx, option)}
  <div class="lab-work__filters">${categoryFilters(ctx)}</div>
  <ol class="lab-grid">
    ${ctx.projects.map((p) => html`
    <li class="lab-grid__item" data-category="${esc(p.category)}">
      <a class="lab-grid__link" href="${p.url}" ${projectAttrs(p)}>
        <span class="lab-grid__media">
          ${posterImg(p, { cls: 'lab-cover', small: true })}
          ${loopVideo(p, { mode: 'hover' })}
          <span class="lab-grid__over">
            <span class="lab-grid__title">${titleText(p.title)}</span>
            <span class="lab-grid__kind">${esc(p.kind)} / ${p.year}</span>
          </span>
          <span class="brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </span>
      </a>
    </li>`)}
  </ol>
</section>`;
  return labPage({ path: '/lab/work-grid/', title: 'Work as a grid | Preview only', content });
}

function listPage(ctx) {
  const option = WORK_OPTIONS[2];
  const first = ctx.projects[0];
  const content = html`
<section class="work lab-work" data-lab-list>
  ${workHead(ctx, option)}
  <div class="lab-list">
    <ol class="lab-list__rows">
      ${ctx.projects.map((p, i) => html`
      <li>
        <a class="lab-list__row" href="${p.url}" ${projectAttrs(p)}>
          <span class="lab-list__num" aria-hidden="true">${pad2(i + 1)}</span>
          <span class="lab-list__title">${titleText(p.title)}</span>
          <span class="lab-list__kind">${esc(p.kind)}</span>
          <span class="lab-list__year">${p.year}</span>
        </a>
      </li>`)}
    </ol>
    <div class="lab-list__side" aria-hidden="true">
      <div class="lab-list__window" data-lab-window>
        <img class="lab-cover" src="${esc(first.poster.src)}" alt="" decoding="async">
        <video class="lab-cover" muted loop playsinline preload="none"></video>
        <span class="brackets is-on"><i></i><i></i><i></i><i></i></span>
      </div>
      <p class="lab-list__caption"><span data-lab-window-title>${esc(first.title)}</span><span data-lab-window-kind>${esc(first.kind)} / ${first.year}</span></p>
    </div>
  </div>
</section>`;
  return labPage({ path: '/lab/work-list/', title: 'Work as a list | Preview only', content });
}

function stripPage(ctx) {
  const option = WORK_OPTIONS[3];
  const content = html`
<section class="work lab-work" data-lab-strip>
  ${workHead(ctx, option)}
  <div class="lab-strip" data-lab-strip-pin>
    <div class="lab-strip__view">
      <ol class="lab-strip__track" data-lab-strip-track>
        ${ctx.projects.map((p, i) => html`
        <li class="lab-strip__item">
          <a class="lab-strip__link" href="${p.url}" ${projectAttrs(p)}>
            <span class="lab-strip__media" style="--ar:${p.orientation === 'portrait' ? '0.5625' : p.ratio}">
              ${posterImg(p, { cls: 'lab-cover' })}
              ${loopVideo(p, { mode: 'hover' })}
              <span class="brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            </span>
            <span class="lab-strip__meta">
              <span class="lab-strip__num" aria-hidden="true">${pad2(i + 1)}</span>
              <span class="lab-strip__title">${titleText(p.title)}</span>
              <span class="lab-strip__kind">${esc(p.kind)} / ${p.year}</span>
            </span>
          </a>
        </li>`)}
      </ol>
    </div>
  </div>
</section>`;
  return labPage({ path: '/lab/work-strip/', title: 'Work as a filmstrip | Preview only', content });
}

function scrollPage(ctx) {
  const cats = ctx.site.work.categories.filter((c) => ctx.projects.some((p) => p.category === c.id));
  const content = html`
<section class="lab-scroll" data-lab-scroll aria-label="Work">
  <div class="lab-scroll__stage">
    <div class="lab-scroll__layers" aria-hidden="true">
      ${ctx.projects.map((p, i) => html`
      <div class="lab-scroll__layer${i === 0 ? ' is-active' : ''}" data-loop="${esc(p.loop?.hd || p.loop?.sd || '')}">
        <img class="lab-cover lab-scroll__img--${p.orientation}" ${i < 2 ? `src="${esc(still(p))}"` : `data-src="${esc(still(p))}"`} alt="" decoding="async">
      </div>`)}
    </div>
    <div class="lab-scroll__dim" aria-hidden="true"></div>

    <ol class="lab-scroll__list" data-lab-scroll-list>
      ${ctx.projects.map((p, i) => html`
      <li class="lab-scroll__item${i === 0 ? ' is-active' : ''}" data-category="${esc(p.category)}" data-kind="${esc(p.kind)}" data-client="${esc(plain(p.client || ''))}" data-year="${p.year}" data-length="${p.duration ? clock(p.duration) : ''}">
        <a href="${p.url}">${esc(p.title)}</a>
      </li>`)}
    </ol>

    <dl class="lab-scroll__credits" data-lab-scroll-credits aria-live="polite"></dl>

    <div class="lab-scroll__cats" role="group" aria-label="Filter projects" data-lab-scroll-cats>
      <button class="is-active" type="button" data-filter="all" aria-pressed="true">All</button>
      ${cats.map((c) => `<button type="button" data-filter="${esc(c.id)}" aria-pressed="false">${esc(c.label)}</button>`)}
    </div>
    <p class="lab-scroll__hint" aria-hidden="true">Scroll</p>
  </div>
</section>`;
  return labPage({ path: '/lab/work-scroll/', title: 'Work, one at a time | Preview only', footer: false, content });
}

/* -------------------------------------------------------------------------- */
/* A longer project page                                                       */
/* -------------------------------------------------------------------------- */

function deepPage(ctx) {
  const p = ctx.projects.find((x) => x.slug === 'scheels-turkey-hunting') || ctx.projects[0];
  const frames = [1, 2, 3, 4, 5, 6].map((n) => `/lab-assets/frames/scheels-${pad2(n)}.jpg`);
  const rows = [
    ['Type', p.kind],
    p.client && ['Client', plain(p.client)],
    p.role && ['Role', p.role],
    p.camera && ['Camera', p.camera],
    ['Year', p.year],
    p.duration && ['Length', clock(p.duration)],
    ...(p.credits || []).map((c) => [c.label, plain(c.value)]),
  ].filter(Boolean);
  const need = (text) => `<p class="lab-need"><span>Needed from you</span>${esc(text)}</p>`;

  const content = html`
<article class="lab-deep">
  <aside class="lab-deep__side">
    <div class="lab-deep__sticky">
      <p class="label">E2 / In depth / Preview only</p>
      <h1 class="lab-deep__title">${titleText(p.title)}</h1>
      <p class="lab-deep__text">${esc(p.description)}</p>
      <dl class="details__credits">
        ${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)}
      </dl>
      <details class="faq__item lab-deep__more" open>
        <summary><span>The idea</span><span class="faq__icon" aria-hidden="true"></span></summary>
        ${need('Three or four sentences in your own words: why you made it and what you wanted people to feel.')}
      </details>
      <details class="faq__item lab-deep__more">
        <summary><span>How it was made</span><span class="faq__icon" aria-hidden="true"></span></summary>
        ${need('The shoot in a few lines: where, how long, what was hard, what you would point out to another filmmaker.')}
      </details>
      <p><a class="link-arrow hover-blur" href="/contact/">${chars('Create something like this')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a></p>
    </div>
  </aside>

  <div class="lab-deep__main">
    <a class="lab-deep__film" href="${p.url}" ${projectAttrs(p)}>
      ${posterImg(p, { cls: 'lab-cover', lazy: false })}
      ${loopVideo(p, { mode: 'view' })}
      <span class="lab-deep__play"><span class="film__play-icon" aria-hidden="true"></span>Play film${p.duration ? ` <span>${clock(p.duration)}</span>` : ''}</span>
    </a>

    <p class="label lab-deep__label">Frames</p>
    <div class="lab-deep__frames">
      ${frames.map((src, i) => `<figure class="lab-deep__frame${i % 3 === 0 ? ' lab-deep__frame--wide' : ''}" data-reveal="clip"><img src="${src}" alt="" loading="lazy" decoding="async"></figure>`)}
    </div>

    <p class="label lab-deep__label">Other cuts</p>
    <div class="lab-deep__cuts">
      <div class="lab-box lab-box--tall">${need('The vertical cut for Instagram and TikTok.')}</div>
      <div class="lab-box lab-box--tall">${need('A 15 second version, if you made one.')}</div>
      <div class="lab-box lab-box--tall">${need('Another cut, or leave this one out.')}</div>
    </div>

    <p class="label lab-deep__label">Behind the scenes</p>
    <div class="lab-deep__bts">
      <div class="lab-box">${need('A photo of you shooting it.')}</div>
      <div class="lab-box">${need('The setup, the location, or the gear laid out.')}</div>
    </div>
  </div>
</article>`;
  return labPage({ path: '/lab/project-in-depth/', title: 'A longer project page | Preview only', content });
}

export function labPages(ctx) {
  return [indexPage(ctx), gridPage(ctx), listPage(ctx), stripPage(ctx), scrollPage(ctx), deepPage(ctx)];
}
