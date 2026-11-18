// Services page. This is the page written for Google as much as for people:
// plain text about what Ayden offers, where, and how it works.
import { esc, html } from '../lib/html.js';
import { chars, projectAttrs, posterImg, loopVideo, cta, ARROW } from './components.js';
import { breadcrumbLd, businessLd } from '../lib/seo.js';

export function servicesPage(ctx) {
  const { site } = ctx;
  const s = site.services;
  const loc = site.location;

  const content = html`
<section class="services">
  <header class="page-head">
    <p class="label" data-reveal>Services</p>
    <h1 class="page-title" data-reveal="rise">${esc(s.heading)}</h1>
    <p class="page-lead" data-reveal>${esc(s.lead)}</p>
  </header>

  <div class="services__list">
    ${s.items.map((item) => {
      const project = ctx.projects.find((p) => p.slug === item.project);
      return html`
    <article class="service" id="${esc(item.slug)}">
      <div class="service__text">
        <h2 class="service__title" data-reveal="rise">${esc(item.title)}</h2>
        <p class="service__summary" data-reveal>${esc(item.summary)}</p>
        <p class="service__body" data-reveal>${esc(item.body)}</p>
        <p data-reveal>
          <a class="link-arrow hover-blur" href="${item.href || '/contact/'}">${chars(item.href ? 'See the photography' : `Ask about ${item.title.toLowerCase()}`)}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a>
        </p>
      </div>
      ${project ? html`
      <a class="service__example" href="${project.url}" ${projectAttrs(project)}>
        <span class="service__media" data-reveal="clip">
          ${posterImg(project, { cls: 'service__img' })}
          ${loopVideo(project, { mode: 'view' })}
          <span class="brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </span>
        <span class="service__caption"><span>Example</span><span>${esc(project.title)}</span></span>
      </a>` : ''}
    </article>`;
    })}
  </div>

  <section class="areas" aria-labelledby="areas-title">
    <h2 class="section-title" id="areas-title" data-reveal="rise">${esc(s.areasHeading)}</h2>
    <p class="areas__text" data-reveal>${esc(s.areasText)}</p>
  </section>
</section>
${cta(ctx, { eyebrow: `Video production in ${loc.city}, ${loc.region}` })}`;

  return {
    path: '/services/',
    id: 'services',
    nav: 'services',
    title: `Video Production Services in ${loc.city}, ${loc.region} | ${site.seo.titleSuffix}`,
    description: `Brand films, commercials, social media content and photography in ${loc.city}, ${loc.regionName} and beyond. See how it works and get a quote.`,
    jsonld: [
      businessLd(ctx),
      breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services/' }]),
    ],
    content,
  };
}
