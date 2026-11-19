// Services page. This is the page written for Google as much as for people:
// plain text about what Ayden offers and where.
import { esc, html } from '../lib/html.js';
import { chars, projectAttrs, posterImg, loopVideo, picture, cta, ARROW } from './components.js';
import { breadcrumbLd, businessLd } from '../lib/seo.js';

export function servicesPage(ctx) {
  const { site } = ctx;
  const s = site.services;
  const loc = site.location;

  // The title is printed in phrases (split after each comma), and a phrase is
  // kept together when it fits on a line. So "Full-Scale Video Production,
  // Curated for You" breaks after the comma instead of in the middle of
  // "Video Production". A title without a comma is one phrase and wraps as usual.
  const titlePhrases = String(s.heading || '').split(/(?<=,)\s+/).filter(Boolean);
  // The description ends with a short sentence of its own ("Open to travel.").
  // It is kept in one piece so a line never ends on "Open" with "to travel." below it.
  const leadParts = /^(.*[.!?])\s+([^.!?]{1,28}[.!?])$/.exec(String(s.lead || ''));
  const leadHtml = leadParts
    ? `${esc(leadParts[1])} <span class="page-lead__last">${esc(leadParts[2])}</span>`
    : esc(s.lead);

  const content = html`
<section class="services">
  <header class="page-head">
    <p class="label" data-reveal>Services</p>
    <h1 class="page-title" data-reveal="rise">${titlePhrases.map((phrase) => `<span class="page-title__phrase">${esc(phrase)}</span>`).join(' ')}</h1>
    <p class="page-lead" data-reveal>${leadHtml}</p>
  </header>

  <div class="services__list">
    ${s.items.map((item) => {
      const project = ctx.projects.find((p) => p.slug === item.project);
      // A row with no film to show (Photography) shows a photograph instead:
      // the one named in site.json ("photo": "brand/01-dumbbells"), or without
      // that the first photo in Ayden's order. It links where the row links.
      const photo = !project && item.href ? (ctx.photos.find((p) => p.id === item.photo) || ctx.photos[0]) : null;
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
      ${photo ? html`
      <a class="service__example" href="${esc(item.href)}">
        <span class="service__media" data-reveal="clip">
          ${picture(photo, { alt: photo.alt, sizes: '(min-width: 900px) 40vw, 92vw', cls: 'service__img' })}
          <span class="brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </span>
        <span class="service__caption"><span>Example</span><span>${esc(photo.categoryLabel)}</span></span>
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
    description: `Brand films, commercials, social media content, and photography in ${loc.city}, ${loc.regionName}. Open to travel. Get a quote.`,
    jsonld: [
      businessLd(ctx),
      breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services/' }]),
    ],
    content,
  };
}
