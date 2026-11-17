// Home page: full-screen video hero with scattered project titles, then the
// scrolling sections (statement, selected work, services, stills, about).
import { esc, html, pad2, clock } from '../lib/html.js';
import { chars, words, projectAttrs, posterImg, loopVideo, picture, sectionHead, cta } from './components.js';
import { businessLd, personLd, websiteLd } from '../lib/seo.js';

// Where the featured titles sit on the hero, in % of the screen (centre point),
// plus a depth used for the mouse parallax. Add more spots to feature more.
const SPOTS = [
  { x: 18, y: 25, depth: 0.6 },
  { x: 57, y: 18, depth: 0.95 },
  { x: 80, y: 36, depth: 0.5 },
  { x: 27, y: 70, depth: 0.85 },
  { x: 64, y: 78, depth: 0.55 },
  { x: 83, y: 64, depth: 1 },
  { x: 14, y: 50, depth: 0.7 },
  { x: 43, y: 87, depth: 0.65 },
];

// Column placement of the "selected work" cards (a loose, staggered grid).
const CARD_LAYOUT = ['a', 'b', 'c', 'd', 'e', 'f'];

export function homePage(ctx) {
  const { site } = ctx;
  const loc = site.location;
  const featured = ctx.featured.slice(0, SPOTS.length);
  const reel = ctx.projects.find((p) => p.slug === site.home.reelProject) || featured[0];
  const cards = featured.slice(0, CARD_LAYOUT.length);
  const stills = pickStills(ctx.photos, 10);
  const portrait = ctx.media.about.portrait;

  const hero = html`
<section class="hero" data-hero aria-label="Featured work">
  <div class="hero__media" aria-hidden="true">
    <div class="hero__stack" data-hero-stack>
      <div class="hero__layer is-base" data-hero-base ${projectAttrs(reel)}>
        ${posterImg(reel, { lazy: false, cls: 'hero__img' })}
      </div>
    </div>
    <div class="hero__shade"></div>
  </div>

  <h1 class="hero__title">
    <span class="hero__name" data-hero-name>${chars(site.name)}</span>
    <span class="hero__role">${esc(site.role)} <span class="hero__role-sep" aria-hidden="true">/</span> ${esc(loc.city)}, ${esc(loc.regionName)}</span>
  </h1>

  <ul class="hero__list" data-hero-list aria-label="Featured projects">
    ${featured.map((p, i) => html`
    <li class="hero__item" style="--x:${SPOTS[i].x};--y:${SPOTS[i].y};--depth:${SPOTS[i].depth};--n:${i}">
      <a class="hero__link hover-blur" href="${p.url}" data-hero-link data-cursor="View" ${projectAttrs(p)}>
        <span class="hero__num" aria-hidden="true">${pad2(i + 1)}</span>
        <span class="hero__label">${chars(p.title)}</span>
      </a>
    </li>`)}
  </ul>

  <div class="hero__foot">
    <p class="hero__now" data-hero-now>
      <span class="hero__now-kind" data-hero-now-kind>${esc(reel.kind)}</span>
      <span class="hero__now-title" data-hero-now-title>${esc(reel.title)}</span>
    </p>
    <a class="hero__reel hover-blur" href="${reel.url}" data-cursor="Play">
      <span class="hero__reel-dot" aria-hidden="true"></span>${chars('Play reel')}${reel.duration ? `<span class="hero__reel-time">${clock(reel.duration)}</span>` : ''}
    </a>
    <p class="hero__clock"><span data-clock data-tz="${esc(loc.timezone)}">--:--</span> ${esc(loc.city)}, ${esc(loc.region)}</p>
  </div>
</section>`;

  const statement = html`
<section class="statement" id="intro" data-statement aria-label="Introduction">
  <p class="statement__text" data-words>${words(site.home.statement)}</p>
  <div class="statement__meta" data-reveal>
    <div><p class="label">Based in</p><p>${esc(loc.city)}, ${esc(loc.regionName)}</p></div>
    <div><p class="label">Making</p><p>Brand films, commercials, social content and photography</p></div>
    <div><p class="label">More</p><p><a class="hover-blur" href="/about/">${chars('About Ayden')}</a><br><a class="hover-blur" href="/services/">${chars('Services')}</a></p></div>
  </div>
</section>`;

  const selected = html`
<section class="selected" aria-labelledby="selected-title">
  ${sectionHead({ num: 1, title: site.home.workHeading, id: 'selected-title', link: { href: '/work/', label: `All work (${ctx.projects.length})` } })}
  <div class="selected__grid">
    ${cards.map((p, i) => html`
    <article class="card card--${CARD_LAYOUT[i]}" data-parallax="${[0.05, -0.04, 0.03, -0.05, 0.04, -0.03][i]}">
      <a class="card__link" href="${p.url}" data-cursor="Play" ${projectAttrs(p)}>
        <div class="card__media" data-reveal="clip">
          ${posterImg(p, { cls: 'card__img' })}
          ${loopVideo(p, { mode: 'view' })}
          <span class="brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </div>
        <div class="card__meta">
          <span class="card__num" aria-hidden="true">${pad2(i + 1)}</span>
          <h3 class="card__title">${esc(p.title)}</h3>
          <p class="card__kind">${esc(p.kind)}<span aria-hidden="true"> / </span>${p.year}</p>
        </div>
      </a>
    </article>`)}
  </div>
</section>`;

  const services = html`
<section class="svc-teaser" aria-labelledby="svc-title">
  ${sectionHead({ num: 2, title: site.home.servicesHeading, id: 'svc-title', link: { href: '/services/', label: 'Services' } })}
  <ul class="svc-list" data-svc-list>
    ${site.services.items.map((s, i) => {
      const project = ctx.projects.find((p) => p.slug === s.project);
      const preview = project ? project.poster.src : (stills[0]?.src || '');
      return html`
    <li class="svc" data-reveal style="--d:${i * 60}ms">
      <a class="svc__link" href="${s.href || `/services/#${s.slug}`}"${preview ? ` data-preview="${esc(preview)}"` : ''}>
        <span class="svc__num" aria-hidden="true">${pad2(i + 1)}</span>
        <span class="svc__title">${esc(s.title)}</span>
        <span class="svc__summary">${esc(s.summary)}</span>
        <span class="svc__arrow" aria-hidden="true">&#8599;</span>
      </a>
    </li>`;
    })}
  </ul>
  <div class="svc-preview" data-svc-preview aria-hidden="true"><img alt="" decoding="async"></div>
</section>`;

  const stillsSection = stills.length ? html`
<section class="stills" aria-labelledby="stills-title">
  ${sectionHead({ num: 3, title: site.home.photoHeading, id: 'stills-title', link: { href: '/photography/', label: 'Photography' } })}
  <div class="stills__viewport">
    <div class="stills__track" data-stills>
      ${stills.map((img, i) => html`
      <a class="stills__item" href="/photography/" style="--ar:${(img.width / img.height).toFixed(4)}" tabindex="${i === 0 ? 0 : -1}" aria-label="Open the photography page">
        ${picture(img, { alt: img.alt, sizes: '(min-width: 900px) 34vw, 70vw' })}
      </a>`)}
    </div>
  </div>
  <p class="stills__text" data-reveal>${esc(site.home.photoText)}</p>
</section>` : '';

  const about = html`
<section class="about-teaser" aria-labelledby="about-teaser-title">
  ${portrait ? html`
  <figure class="about-teaser__img" data-reveal="clip">
    <div data-parallax="0.06">${picture(portrait, { alt: site.about.portraitAlt, sizes: '(min-width: 900px) 36vw, 90vw' })}</div>
  </figure>` : ''}
  <div class="about-teaser__text">
    <p class="section-head__num" aria-hidden="true">(04)</p>
    <h2 class="about-teaser__title" id="about-teaser-title" data-reveal="rise">${esc(site.home.aboutHeading)}</h2>
    <p data-reveal>${esc(site.about.bio[0])}</p>
    <a class="link-arrow hover-blur" href="/about/">${chars('About Ayden')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a>
  </div>
</section>`;

  return {
    path: '/',
    id: 'home',
    nav: 'home',
    title: site.seo.homeTitle,
    description: site.seo.description,
    preload: [{ href: reel.poster.src, as: 'image', fetchpriority: 'high' }],
    jsonld: [websiteLd(ctx), businessLd(ctx), personLd(ctx)],
    content: [hero, statement, selected, services, stillsSection, about, cta(ctx)].join('\n'),
  };
}

/** Take photos round-robin from each category so the strip shows a mix. */
function pickStills(photos, max) {
  const byCat = new Map();
  for (const p of photos) {
    if (!byCat.has(p.category)) byCat.set(p.category, []);
    byCat.get(p.category).push(p);
  }
  const lists = [...byCat.values()];
  const out = [];
  for (let i = 0; out.length < max && lists.some((l) => l[i]); i += 1) {
    for (const l of lists) if (l[i] && out.length < max) out.push(l[i]);
  }
  return out;
}
