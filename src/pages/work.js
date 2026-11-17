// Work page: every project, grouped into three columns.
// "Wall" view: the columns scroll forever in opposite directions (desktop).
// "Index" view: a plain list you can scan (default on phones, toggle on desktop).
import { esc, html, pad2, clock } from '../lib/html.js';
import { projectAttrs, posterImg, loopVideo, chars } from './components.js';
import { breadcrumbLd, workListLd } from '../lib/seo.js';

export function workPage(ctx) {
  const { site } = ctx;
  const groups = site.work.categories
    .map((cat) => ({ ...cat, projects: ctx.projects.filter((p) => p.category === cat.id) }))
    .filter((g) => g.projects.length);

  const content = html`
<section class="work" data-work>
  <header class="work__head">
    <h1 class="work__title">${esc(site.work.heading)}<sup>${ctx.projects.length}</sup></h1>
    <p class="work__lead">${esc(site.work.lead)}</p>
    <div class="work__views" role="group" aria-label="Layout">
      <button class="hover-blur is-active" type="button" data-view="wall" aria-pressed="true">${chars('Wall')}</button>
      <button class="hover-blur" type="button" data-view="index" aria-pressed="false">${chars('Index')}</button>
    </div>
  </header>

  <div class="wall" data-wall>
    ${groups.map((g, gi) => html`
    <section class="wall__col" data-wall-col style="--col:${gi}" aria-labelledby="cat-${g.id}">
      <h2 class="wall__label" id="cat-${g.id}"><span aria-hidden="true">${pad2(gi + 1)}</span> ${esc(g.label)} <sup>${g.projects.length}</sup></h2>
      <ol class="wall__track" data-wall-track>
        ${g.projects.map((p, i) => html`
        <li class="tile tile--${p.orientation}">
          <a class="tile__link" href="${p.url}" data-cursor="Play" ${projectAttrs(p)}>
            <span class="tile__num" aria-hidden="true">${pad2(i + 1)}</span>
            <span class="tile__media" style="--ar:${p.tileRatio}">
              ${posterImg(p, { cls: 'tile__img', small: true })}
              ${loopVideo(p, { mode: 'hover' })}
            </span>
            <span class="tile__info">
              <span class="tile__title">${esc(p.title)}</span>
              <span class="tile__kind">${esc(p.kind)}</span>
              <span class="tile__year">${p.year}${p.duration ? ` <span aria-hidden="true">/</span> ${clock(p.duration)}` : ''}</span>
            </span>
          </a>
        </li>`)}
      </ol>
    </section>`)}
  </div>
</section>`;

  return {
    path: '/work/',
    id: 'work',
    nav: 'work',
    title: `Video Work: Brand Films, Commercials & Creative | ${site.seo.titleSuffix}`,
    description: `Selected video work by ${site.name}, a ${site.location.city}, ${site.location.region} videographer and cinematographer: brand films, commercials, social content, weddings and events.`,
    jsonld: [breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'Work', path: '/work/' }]), workListLd(ctx)],
    content,
  };
}
