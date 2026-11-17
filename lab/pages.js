// Design options ("the lab").
//
// Ayden does not build websites, so describing a design choice in words does
// not help him much. This page SHOWS the choices instead, using his own
// footage, and gives every choice a short code (D1, D2 ...) he can answer with.
//
// It exists only in the local preview: `node dev.js` builds with `--lab`,
// a normal `node build.js` (and so the published site) leaves it out.
//
//   /lab/      the options page
//
// When Ayden picks an option, build it into src/ properly and remove it here.
// Styles: lab/assets/lab.css. Behaviour: lab/assets/lab.js.
//
// Picked on 2026-11-17 and since built into the site (so no longer shown here):
//   A7 + B1  his name in Inter Tight capitals over "Cinematographer / Mankato, MN"
//   C5       the Work page, one project at a time
//   D5       the before and after slider (home page)
//   E1       project pages stay as they are
//   F        his own sentence under the reel: "Creating content worth watching."
import { esc, html } from '../src/lib/html.js';

// The stand-in reel on the home page is five clips. Rough start time of each, in seconds.
const REEL_SEGMENTS = [
  { at: 0, label: 'SCHEELS' },
  { at: 3.5, label: 'Reborn Legacy' },
  { at: 7, label: 'Western Fest' },
  { at: 11, label: 'Bison' },
  { at: 14.5, label: 'SCHEELS' },
];

const HEAD = '<link rel="stylesheet" href="/lab-assets/lab.css">';
const SCRIPT = '<script type="module" src="/lab-assets/lab.js"></script>';

const still = (p) => p.loop?.still || p.poster.src;

/** Every lab page: kept out of search engines, with the lab stylesheet and script. */
function labPage(page) {
  return { id: 'lab', nav: '', noindex: true, description: 'Design options. Local preview only.', head: HEAD, ...page, content: `${page.content}\n${SCRIPT}` };
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

function indexPage(ctx) {
  const { site } = ctx;
  const reel = ctx.projects.find((p) => p.slug === site.home.reelProject) || ctx.projects[0];
  const reelStill = still(reel);
  const reelLoop = reel.loop?.sd || reel.loop?.hd || '';
  const firstBio = site.about.bio.join(' ');

  const ideasSection = section({
    id: 'ideas',
    letter: 'D',
    title: 'Ideas from the other two sites',
    lead: 'Things kaiblamey.com and danikbartolini.com do that your site does not do yet. Say the codes you like. None of them are built in.',
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

    <article class="lab-idea lab-idea--text">
      <div class="lab-idea__text">
        <p class="lab-idea__code"><b>D6</b> From Kai Blamey</p>
        <h3>Scroll through titles on the home screen</h3>
        <p>His home screen works like your new Work page: one film fills the screen and scrolling moves through the titles. It could replace your home screen too. You would lose the hover effect you asked for, so I would keep it for the Work page only.</p>
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

  const content = html`
<div class="lab" data-lab>
  <header class="page-head">
    <p class="label">Preview only. Nothing on this page is on your live site.</p>
    <h1 class="page-title">Design options</h1>
    <p class="page-lead">Ideas that are not built yet. Each has a short code. Tell me the codes you like and I will build those into the site.</p>
    <ul class="lab-done">
      <li><b>Built from your picks</b></li>
      <li>A7 + B1: your name in capitals over one small line</li>
      <li>C5: the Work page, one project at a time</li>
      <li>D5: the before and after slider on the home page</li>
      <li>E1: project pages as they are</li>
      <li>Your own sentence under the reel</li>
    </ul>
  </header>
  ${ideasSection}
  <p class="lab-end">Want to see something that is not here? Ask. I can add it to this page before building it for real.</p>
</div>`;

  return labPage({ path: '/lab/', title: 'Design options | Preview only', footer: false, content });
}

export function labPages(ctx) {
  return [indexPage(ctx)];
}
