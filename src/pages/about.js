// About page: portrait, bio, a few facts and the client list.
import { esc, html } from '../lib/html.js';
import { chars, picture, cta } from './components.js';
import { breadcrumbLd, personLd } from '../lib/seo.js';

export function aboutPage(ctx) {
  const { site } = ctx;
  const a = site.about;
  const portrait = ctx.media.about[a.portrait?.split('/').pop() || 'portrait'] || ctx.media.about.portrait;
  const clients = a.clients || [];

  const content = html`
<section class="about">
  <header class="page-head page-head--about">
    <h1 class="page-title" data-reveal="rise">${esc(a.heading)}</h1>
    <p class="page-lead" data-reveal>${esc(a.lead)}</p>
  </header>

  <div class="about__grid">
    ${portrait ? html`
    <figure class="about__portrait" data-reveal="clip">
      <div data-parallax="0.07">${picture(portrait, { alt: a.portraitAlt, sizes: '(min-width: 900px) 38vw, 92vw', lazy: false })}</div>
    </figure>` : ''}

    <div class="about__col about__col--bio">
      <h2 class="label">Bio</h2>
      ${a.bio.map((p, i) => `<p${i === 0 ? ' class="about__lead"' : ''} data-reveal>${esc(p)}</p>`)}
      <p data-reveal><a class="link-arrow hover-blur" href="/contact/">${chars('Get in touch')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a></p>
    </div>

    <div class="about__col about__col--facts">
      <h2 class="label">Details</h2>
      <dl class="facts" data-reveal>
        ${a.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)}
      </dl>
    </div>

    <div class="about__col about__col--services">
      <h2 class="label">What I shoot</h2>
      <ul class="about__services" data-reveal>
        ${site.services.items.map((s) => `<li><a class="hover-blur" href="${s.href || `/services/#${s.slug}`}">${chars(s.title)}</a></li>`)}
      </ul>
    </div>
  </div>

  ${clients.length ? html`
  <div class="clients" aria-label="${esc(a.clientsHeading)}">
    <p class="label">${esc(a.clientsHeading)}</p>
    <div class="marquee" data-marquee>
      <ul class="marquee__track">
        ${clients.map((c) => `<li>${esc(c)}</li>`)}
      </ul>
      <ul class="marquee__track" aria-hidden="true">
        ${clients.map((c) => `<li>${esc(c)}</li>`)}
      </ul>
    </div>
  </div>` : ''}
</section>
${cta(ctx)}`;

  return {
    path: '/about/',
    id: 'about',
    nav: 'about',
    title: `About ${site.name} | ${site.location.city}, ${site.location.region} Videographer & Cinematographer`,
    description: `${site.name} is a videographer, cinematographer and photographer based in ${site.location.city}, ${site.location.regionName}, working with businesses in Minnesota and beyond.`,
    image: portrait?.src,
    ogType: 'profile',
    jsonld: [personLd(ctx), breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'About', path: '/about/' }])],
    content,
  };
}
