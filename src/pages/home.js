// Home page: full-screen reel with project titles scattered over it, then the
// scrolling sections (statement, selected work, before and after, services, stills, about).
//
// How the hero behaves (see src/assets/js/home.js):
//   hover a title   a blurred strip of that project slides in from the side the title is on
//   click a title   the project opens full screen, sharpens and plays; the title becomes "See project"
//   click the name  back to the reel
import { esc, html, clock } from '../lib/html.js';
import { chars, spread, titleText, socialLinks, projectAttrs, posterImg, loopVideo, picture, sectionHead, cta, gradeSection, ARROW } from './components.js';
import { businessLd, personLd, websiteLd } from '../lib/seo.js';

// The hero is a grid of 3 columns x 2 rows; each cell holds one title.
const HERO_TITLES = 6;

// Column placement of the "selected work" cards (a loose, staggered grid).
const CARD_LAYOUT = ['a', 'b', 'c', 'd', 'e', 'f'];

/** Image shown for a project before its loop plays: the loop's first frame, else its poster. */
const still = (p) => p.loop?.still || p.poster.src;
const stillSmall = (p) => p.loop?.stillSmall || p.poster.thumb || p.poster.src;

export function homePage(ctx) {
  const { site } = ctx;
  // The six titles over the reel: the list in site.json (home.heroProjects), or
  // the featured projects when that list is empty. Top row first, left to right.
  const chosen = (site.home.heroProjects || []).map((slug) => ctx.projects.find((p) => p.slug === slug)).filter(Boolean);
  const heroProjects = (chosen.length ? chosen : ctx.featured).slice(0, HERO_TITLES);
  const reel = ctx.projects.find((p) => p.slug === site.home.reelProject) || heroProjects[0];
  // The "Selected work" cards further down are the projects marked "featured": true.
  const cards = ctx.featured.slice(0, CARD_LAYOUT.length);
  const stills = pickStills(ctx.photos, 10);
  const portrait = ctx.media.about.portrait;

  const hero = html`
<section class="hero" data-hero aria-label="Featured work">
  <div class="hero__media" aria-hidden="true">
    <div class="hero__reel" data-hero-reel data-loop="${esc(reel.loop?.sd || '')}" data-loop-hd="${esc(reel.loop?.hd || '')}">
      <img class="hero__img" src="${esc(still(reel))}" alt="" fetchpriority="high" decoding="async">
    </div>
    ${heroProjects.map((p) => html`
    <div class="hero__layer" data-hero-layer="${esc(p.slug)}" data-loop="${esc(p.loop?.sd || '')}" data-loop-hd="${esc(p.loop?.hd || '')}" data-still="${esc(still(p))}">
      <img class="hero__img" data-src="${esc(stillSmall(p))}" alt="" decoding="async">
    </div>`)}
    <div class="hero__dim"></div>
  </div>
  <div class="hero__bar hero__bar--top" aria-hidden="true"></div>
  <div class="hero__bar hero__bar--bottom" aria-hidden="true"></div>

  <h1 class="hero__title">
    <button class="hero__name" type="button" data-hero-name aria-label="${esc(site.name)}. Show the reel">${chars(site.name)}</button>
    <span class="hero__role">${spread(site.home.nameLine?.length ? site.home.nameLine : [site.role])}</span>
  </h1>
  <div class="hero__lens" data-hero-lens aria-hidden="true"></div>

  <div class="hero__grid" data-hero-grid>
    ${heroProjects.map((p, i) => html`
    <div class="hero__cell">
      <div class="hero__item" data-hero-item data-project="${esc(p.slug)}" style="--n:${i}">
        <button class="hero__link hover-blur" type="button" data-hero-link>${chars(p.title.replace(/ - /g, ' - '))}</button>
        <a class="hero__see hover-blur" href="${p.url}" data-hero-see tabindex="-1" aria-label="See project: ${esc(p.title)}"><span aria-hidden="true">${chars('See project')}</span></a>
      </div>
    </div>`)}
  </div>

  <div class="hero__foot">
    <a class="hero__scroll hover-blur" href="#intro">${chars('Scroll')}</a>
    <a class="hero__reel-link hover-blur" href="${reel.url}">
      <span class="hero__reel-dot" aria-hidden="true"></span>${chars('Play reel')}${reel.duration ? `<span class="hero__reel-time">${clock(reel.duration)}</span>` : ''}
    </a>
    ${socialLinks(site, { cls: 'hero__social' })}
  </div>
</section>`;

  // The tagline is printed as two halves (split by word count), so a phone can
  // stack them as two lines of equal width. Each word is its own span because
  // the words light up one after another as the page scrolls (home.js).
  // --ems is roughly how wide the whole line is, in ems, in the heading serif
  // (about 0.36 of an em per character, measured on "Create content WORTH
  // watching."). main.css uses it to size the line to the width of the page
  // before the script fits it exactly.
  const taglineWords = String(site.home.statement || '').split(/\s+/).filter(Boolean);
  const taglineCut = Math.ceil(taglineWords.length / 2);
  const taglineEms = Math.max(4, taglineWords.join(' ').length * 0.363).toFixed(2);
  const taglineLine = (list, start) => `<span class="statement__line">${list.map((w, i) => `<span class="word" style="--i:${start + i}">${esc(w)}</span>`).join(' ')}</span>`;
  const statement = html`
<section class="statement" id="intro" data-statement aria-label="Introduction">
  <p class="statement__text" data-words style="--ems:${taglineEms}">${[taglineLine(taglineWords.slice(0, taglineCut), 0), taglineLine(taglineWords.slice(taglineCut), taglineCut)].join(' ')}</p>
</section>`;

  const selected = html`
<section class="selected" aria-labelledby="selected-title">
  ${sectionHead({ title: site.home.workHeading, id: 'selected-title', link: { href: '/work/', label: 'All work' } })}
  <div class="selected__grid">
    ${cards.map((p, i) => html`
    <article class="card card--${CARD_LAYOUT[i]}" data-parallax="${[0.05, -0.04, 0.03, -0.05, 0.04, -0.03][i]}">
      <a class="card__link" href="${p.url}" ${projectAttrs(p)}>
        <div class="card__media" data-reveal="clip">
          ${posterImg(p, { cls: 'card__img' })}
          ${loopVideo(p, { mode: 'view' })}
          <span class="brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </div>
        <div class="card__meta">
          <h3 class="card__title">${titleText(p.title)}</h3>
          <p class="card__kind">${esc(p.kind)}<span aria-hidden="true"> / </span>${p.year}</p>
        </div>
      </a>
    </article>`)}
  </div>
</section>`;

  // The color grading slider appears once media/grades/ holds a pair.
  const grade = gradeSection(ctx, { title: site.home.gradeHeading || 'Color Grading Showcase', text: site.home.gradeText });

  const services = html`
<section class="svc-teaser" aria-labelledby="svc-title">
  ${sectionHead({ title: site.home.servicesHeading, id: 'svc-title', link: { href: '/services/', label: 'Services' } })}
  <ul class="svc-list">
    ${site.services.items.map((s, i) => {
      // A small picture opens up inside the row on hover (it does not follow the pointer).
      const project = ctx.projects.find((p) => p.slug === s.project);
      const thumb = project ? (project.poster.thumb || project.poster.src) : (stills[0]?.sources[0]?.src || '');
      return html`
    <li class="svc" data-reveal style="--d:${i * 60}ms">
      <a class="svc__link" href="${s.href || `/services/#${s.slug}`}">
        <span class="svc__title">${esc(s.title)}</span>
        <span class="svc__summary">${esc(s.summary)}</span>
        <span class="svc__thumb" aria-hidden="true">${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy" decoding="async">` : ''}</span>
        <span class="svc__arrow" aria-hidden="true">${ARROW}</span>
      </a>
    </li>`;
    })}
  </ul>
</section>`;

  // The line of text under the photos is optional: Ayden chose to have none
  // (site.json -> home.photoText is empty). Put words there to bring it back.
  const photoText = String(site.home.photoText || '').trim();
  const stillsSection = stills.length ? html`
<section class="stills${photoText ? '' : ' stills--bare'}" aria-labelledby="stills-title">
  ${sectionHead({ title: site.home.photoHeading, id: 'stills-title', link: { href: '/photography/', label: 'Photography' } })}
  <div class="stills__viewport">
    <div class="stills__track" data-stills>
      ${stills.map((img, i) => html`
      <a class="stills__item" href="/photography/" style="--ar:${(img.width / img.height).toFixed(4)}" tabindex="${i === 0 ? 0 : -1}" aria-label="Open the photography page">
        ${picture(img, { alt: img.alt, sizes: '(min-width: 900px) 34vw, 70vw' })}
      </a>`)}
    </div>
  </div>
  ${photoText ? `<p class="stills__text" data-reveal>${esc(photoText)}</p>` : ''}
</section>` : '';

  const about = html`
<section class="about-teaser" aria-labelledby="about-teaser-title">
  ${portrait ? html`
  <figure class="about-teaser__img" data-reveal="clip">
    <div data-parallax="0.06">${picture(portrait, { alt: site.about.portraitAlt, sizes: '(min-width: 900px) 36vw, 90vw' })}</div>
  </figure>` : ''}
  <div class="about-teaser__text">
    <h2 class="about-teaser__title" id="about-teaser-title" data-reveal="rise">${esc(site.home.aboutHeading)}</h2>
    <p data-reveal>${esc(site.home.aboutText || site.about.bio[0])}</p>
    <a class="link-arrow hover-blur" href="/about/">${chars('About Ayden')}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a>
  </div>
</section>`;

  return {
    path: '/',
    id: 'home',
    nav: 'home',
    title: site.seo.homeTitle,
    description: site.seo.description,
    preload: [{ href: still(reel), as: 'image', fetchpriority: 'high' }],
    jsonld: [websiteLd(ctx), businessLd(ctx), personLd(ctx)],
    content: [hero, statement, selected, grade, services, stillsSection, about, cta(ctx)].join('\n'),
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
