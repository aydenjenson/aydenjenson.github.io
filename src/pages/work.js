// Work page: one project at a time (Ayden picked this layout; the idea comes
// from kaiblamey.com). One film fills the screen, exactly one screen tall.
// The list of titles is a scroll box: the title at its middle is the active
// one (shown bold) and its footage plays behind. On a computer the list also
// scrolls by itself while the pointer rests below or above its middle; on a
// phone the visitor drags it.
//
//   .work__layers   one full-screen layer per project: its still, and its
//                   preview loop when it has one (work.js adds the <video>)
//   .work__window   the part of the screen the list shows through (it fades out at the top and bottom)
//   .work__list     the scrolling box with every title, as a link to the project page
//   .work__credits  type, client, year and length of the title in the middle
//   .work__cats     All / Brand & Commercial / Creative & Film / Weddings
//
// Without JavaScript the same markup falls back to a plain list of links.
import { esc, html, clock, plain } from '../lib/html.js';
import { titleText } from './components.js';
import { breadcrumbLd, workListLd } from '../lib/seo.js';

/** Picture shown for a project before its loop plays: the loop's first frame, else its poster. */
const still = (p) => p.loop?.still || p.poster.src;

export function workPage(ctx) {
  const { site } = ctx;
  const cats = site.work.categories
    .map((c) => ({ ...c, count: ctx.projects.filter((p) => p.category === c.id).length }))
    .filter((c) => c.count);
  // Only the first two pictures load with the page; work.js fetches the rest as they come near.
  const src = (i, url) => `${i < 2 ? 'src' : 'data-src'}="${esc(url)}"`;

  const content = html`
<section class="work" data-work aria-labelledby="work-title">
  <div class="work__stage">
    <div class="work__layers" aria-hidden="true">
      ${ctx.projects.map((p, i) => html`
      <div class="work__layer work__layer--${p.orientation}${i === 0 ? ' is-active' : ''}" data-loop="${esc(p.loop?.sd || '')}" data-loop-hd="${esc(p.loop?.hd || '')}">
        ${p.orientation === 'portrait' ? `<img class="work__back" ${src(i, p.poster.thumb || p.poster.src)} alt="" decoding="async">` : ''}
        <img class="work__media" ${src(i, still(p))} alt="" decoding="async">
      </div>`)}
    </div>
    <div class="work__dim" aria-hidden="true"></div>

    <header class="sr">
      <h1 id="work-title">${esc(site.work.heading)}</h1>
      <p>${esc(site.work.lead)}</p>
    </header>

    <div class="work__window">
      <ol class="work__list" data-work-list>
        ${ctx.projects.map((p, i) => html`
        <li class="work__item${i === 0 ? ' is-active' : ''}" data-category="${esc(p.category)}" data-kind="${esc(p.kind)}" data-client="${esc(plain(p.client || ''))}" data-year="${p.year}" data-length="${p.duration ? clock(p.duration) : ''}">
          <a href="${p.url}">${titleText(p.title)}</a>
        </li>`)}
      </ol>
    </div>

    <dl class="work__credits" data-work-credits></dl>

    <div class="work__cats" role="group" aria-label="Filter projects" data-work-cats>
      <button class="is-active" type="button" data-filter="all" aria-pressed="true">All</button>
      ${cats.map((c) => `<button type="button" data-filter="${esc(c.id)}" aria-pressed="false">${esc(c.label)}</button>`)}
    </div>
    <p class="work__hint" aria-hidden="true">Scroll the list</p>
  </div>
</section>`;

  return {
    path: '/work/',
    id: 'work',
    nav: 'work',
    title: `Video Work: Brand Films, Commercials, & Creative | ${site.seo.titleSuffix}`,
    description: `Selected video work by ${site.name}, a ${site.location.city}, ${site.location.region} videographer and cinematographer: brand films, commercials, social media content, and creative projects.`,
    preload: [{ href: still(ctx.projects[0]), as: 'image', fetchpriority: 'high' }],
    jsonld: [breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'Work', path: '/work/' }]), workListLd(ctx)],
    content,
  };
}
