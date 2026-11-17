// Contact page and the 404 page.
import { esc, html } from '../lib/html.js';
import { chars } from './components.js';
import { breadcrumbLd, businessLd } from '../lib/seo.js';

export function contactPage(ctx) {
  const { site } = ctx;
  const loc = site.location;
  const key = site.form?.web3formsKey || '';
  const types = site.form?.projectTypes || [];

  const content = html`
<section class="contact">
  <header class="page-head">
    <p class="label" data-reveal>Contact</p>
    <h1 class="page-title" data-reveal="rise">${esc(site.contactPage.heading)}</h1>
    <p class="page-lead" data-reveal>${esc(site.contactPage.lead)}</p>
  </header>

  <div class="contact__grid">
    <form class="form" data-form method="post" action="https://api.web3forms.com/submit" data-email="${esc(site.contact.email)}"${key ? '' : ' data-fallback="mailto"'} novalidate>
      <input type="hidden" name="access_key" value="${esc(key)}">
      <input type="hidden" name="subject" value="New project inquiry from aydenjenson.com">
      <input type="hidden" name="from_name" value="${esc(site.name)} website">
      <input class="form__trap" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">

      <div class="field" data-reveal>
        <label for="f-name">Your name</label>
        <input id="f-name" name="name" type="text" autocomplete="name" required>
      </div>
      <div class="field" data-reveal>
        <label for="f-email">Email</label>
        <input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required>
      </div>
      <div class="field" data-reveal>
        <label for="f-company">Business <span>(optional)</span></label>
        <input id="f-company" name="company" type="text" autocomplete="organization">
      </div>
      ${types.length ? html`
      <fieldset class="field field--chips" data-reveal>
        <legend>What do you need?</legend>
        <div class="chips">
          ${types.map((t, i) => `<label class="chip"><input type="radio" name="project_type" value="${esc(t)}"${i === 0 ? ' checked' : ''}><span>${esc(t)}</span></label>`)}
        </div>
      </fieldset>` : ''}
      <div class="field" data-reveal>
        <label for="f-message">Tell me about it</label>
        <textarea id="f-message" name="message" rows="5" required></textarea>
      </div>
      <div class="form__foot" data-reveal>
        <button class="button" type="submit" data-cursor="Send"><span>Send message</span><span aria-hidden="true">&#8599;</span></button>
        <p class="form__status" data-form-status role="status" aria-live="polite"></p>
      </div>
    </form>

    <aside class="contact__side">
      <div data-reveal>
        <p class="label">Email</p>
        <p><a class="contact__email hover-blur" href="mailto:${esc(site.contact.email)}">${chars(site.contact.email)}</a></p>
      </div>
      ${site.contact.phone ? html`
      <div data-reveal>
        <p class="label">Phone</p>
        <p><a class="hover-blur" href="tel:${esc(site.contact.phone.replace(/[^+\d]/g, ''))}">${chars(site.contact.phone)}</a></p>
      </div>` : ''}
      <div data-reveal>
        <p class="label">Social</p>
        <ul>
          ${site.socials.map((s) => `<li><a class="hover-blur" href="${esc(s.url)}" target="_blank" rel="noopener">${chars(s.label)}<span aria-hidden="true"> &#8599;</span></a></li>`)}
        </ul>
      </div>
      <div data-reveal>
        <p class="label">Based in</p>
        <p>${esc(loc.city)}, ${esc(loc.regionName)}<br><span class="muted"><span data-clock data-tz="${esc(loc.timezone)}">--:--</span> local time</span></p>
      </div>
      ${site.contact.responseTime ? `<p class="muted" data-reveal>${esc(site.contact.responseTime)}</p>` : ''}
    </aside>
  </div>
</section>`;

  return {
    path: '/contact/',
    id: 'contact',
    nav: 'contact',
    title: `Contact | Hire a Videographer in ${loc.city}, ${loc.region} | ${site.seo.titleSuffix}`,
    description: `Get in touch with ${site.name} about a brand film, commercial, social content or photography in ${loc.city}, ${loc.regionName} and beyond.`,
    jsonld: [businessLd(ctx), breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact/' }])],
    content,
  };
}

export function notFoundPage(ctx) {
  const content = html`
<section class="notfound">
  <p class="label">Error 404</p>
  <h1 class="page-title">Out of frame.</h1>
  <p class="page-lead">That page doesn't exist, or it moved when the site was rebuilt.</p>
  <p class="notfound__links">
    <a class="link-arrow hover-blur" href="/work/">${chars('See the work')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a>
    <a class="link-arrow hover-blur" href="/">${chars('Back home')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a>
  </p>
</section>`;

  return {
    path: '/404.html',
    id: 'notfound',
    nav: '',
    title: `Page not found | ${ctx.site.seo.titleSuffix}`,
    description: 'This page could not be found.',
    noindex: true,
    content,
  };
}
