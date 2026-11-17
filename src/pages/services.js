// Services page. This is the page written for Google as much as for people:
// plain text about what Ayden offers, where, and how it works.
import { esc, html, pad2 } from '../lib/html.js';
import { chars, projectAttrs, posterImg, loopVideo, cta } from './components.js';
import { breadcrumbLd, businessLd, faqLd } from '../lib/seo.js';

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
    ${s.items.map((item, i) => {
      const project = ctx.projects.find((p) => p.slug === item.project);
      return html`
    <article class="service" id="${esc(item.slug)}">
      <div class="service__text">
        <p class="service__num" aria-hidden="true">${pad2(i + 1)}</p>
        <h2 class="service__title" data-reveal="rise">${esc(item.title)}</h2>
        <p class="service__summary" data-reveal>${esc(item.summary)}</p>
        <p class="service__body" data-reveal>${esc(item.body)}</p>
        <p data-reveal>
          <a class="link-arrow hover-blur" href="${item.href || '/contact/'}">${chars(item.href ? 'See the photography' : `Ask about ${item.title.toLowerCase()}`)}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a>
        </p>
      </div>
      ${project ? html`
      <a class="service__example" href="${project.url}" data-cursor="Play" ${projectAttrs(project)}>
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

  <section class="process" aria-labelledby="process-title">
    <h2 class="section-title" id="process-title" data-reveal="rise">${esc(s.processHeading)}</h2>
    <ol class="process__steps">
      ${s.process.map((step, i) => html`
      <li class="process__step" data-reveal style="--d:${i * 70}ms">
        <span class="process__num" aria-hidden="true">${pad2(i + 1)}</span>
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.text)}</p>
      </li>`)}
    </ol>
  </section>

  <section class="areas" aria-labelledby="areas-title">
    <div>
      <h2 class="section-title" id="areas-title" data-reveal="rise">${esc(s.areasHeading)}</h2>
      <p data-reveal>${esc(s.areasText)}</p>
    </div>
    <ul class="areas__list" data-reveal>
      ${s.areas.map((a) => `<li>${esc(a)}, ${esc(loc.region)}</li>`)}
    </ul>
  </section>

  <section class="faq" aria-labelledby="faq-title">
    <h2 class="section-title" id="faq-title" data-reveal="rise">${esc(s.faqHeading)}</h2>
    <div class="faq__list">
      ${s.faq.map((f) => html`
      <details class="faq__item" data-reveal>
        <summary><span>${esc(f.q)}</span><span class="faq__icon" aria-hidden="true"></span></summary>
        <p>${esc(f.a)}</p>
      </details>`)}
    </div>
  </section>
</section>
${cta(ctx, { eyebrow: `Video production in ${loc.city}, ${loc.region}` })}`;

  return {
    path: '/services/',
    id: 'services',
    nav: 'services',
    title: `Video Production Services in ${loc.city}, ${loc.region} | ${site.seo.titleSuffix}`,
    description: `Brand films, commercials, social media content, event coverage and photography in ${loc.city}, ${loc.regionName} and across Southern Minnesota. See how it works and get a quote.`,
    jsonld: [
      businessLd(ctx),
      faqLd(s.faq),
      breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services/' }]),
    ],
    content,
  };
}
