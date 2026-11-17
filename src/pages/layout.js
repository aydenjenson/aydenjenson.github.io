// The shell around every page: <head>, navigation, footer, shared overlays.
import { esc, html, pad2 } from '../lib/html.js';
import { chars } from './components.js';

export const NAV = [
  { id: 'work', label: 'Work', href: '/work/' },
  { id: 'photography', label: 'Photography', href: '/photography/' },
  { id: 'services', label: 'Services', href: '/services/' },
  { id: 'about', label: 'About', href: '/about/' },
  { id: 'contact', label: 'Contact', href: '/contact/' },
];

/**
 * page = {
 *   path        '/work/'                 (always starts and ends with a slash)
 *   id          'work'                   (sets <body data-page> and the active nav item)
 *   title       text for <title>
 *   description meta description
 *   content     the HTML that goes inside <main>
 *   image       absolute or root-relative URL for social sharing (optional)
 *   jsonld      array of structured-data objects (optional)
 *   footer      false to hide the footer (full-screen pages)
 *   noindex     true to keep the page out of search engines
 *   preload     [{ href, as, type }] extra <link rel="preload"> (optional)
 * }
 */
export function layout(ctx, page) {
  const { site } = ctx;
  const canonical = ctx.abs(page.path);
  const image = ctx.abs(page.image || '/og.jpg');
  const title = page.title;
  const description = page.description || site.seo.description;
  const jsonld = (page.jsonld || []).filter(Boolean);
  const loc = site.location;

  return html`<!doctype html>
<html lang="${site.language || 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-video-preview:-1">'}
<meta name="author" content="${esc(site.name)}">
<meta name="geo.region" content="${esc(loc.country)}-${esc(loc.region)}">
<meta name="geo.placename" content="${esc(loc.city)}">
<meta name="theme-color" content="#0d0a08">
<meta name="color-scheme" content="dark">

<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(page.ogTitle || title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.ogTitle || title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/intertight-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrumentserif-normal.woff2" as="font" type="font/woff2" crossorigin>
${(page.preload || []).map((p) => `<link rel="preload" href="${esc(p.href)}" as="${p.as}"${p.type ? ` type="${p.type}"` : ''}${p.fetchpriority ? ` fetchpriority="${p.fetchpriority}"` : ''}>`)}
<link rel="stylesheet" href="${ctx.asset('/assets/css/main.css')}">
<script>
  // Runs before first paint: marks that JavaScript is on and whether this is
  // the first page of the visit (the home page plays its intro only then).
  (function (d) {
    d.classList.add('js');
    try { if (!sessionStorage.getItem('aj-seen')) d.classList.add('first-visit'); } catch (e) {}
    // Work page: choose the wall layout before anything is drawn, so the list never flashes first.
    try {
      if (/^\\/work\\/?$/.test(location.pathname) && matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)').matches && sessionStorage.getItem('aj-work') !== 'index') d.dataset.work = 'wall';
    } catch (e) {}
    // The github.io test address should not show up in Google; only the real domain should.
    if (/\\.github\\.io$/.test(location.hostname)) {
      var m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow';
      document.head.appendChild(m);
    }
    // Safety net: if the main script never starts, show everything anyway.
    setTimeout(function () { if (!window.__ajReady) d.classList.remove('js', 'first-visit'); }, 5000);
  })(document.documentElement);
</script>
${jsonld.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="page page--${page.id}" data-page="${page.id}">
<a class="skip-link" href="#main">Skip to content</a>
<div class="grain" aria-hidden="true"></div>

<header class="nav" data-nav>
  <a class="nav__brand hover-blur" href="/" aria-label="${esc(site.name)}, home">${chars(site.name)}</a>
  <nav class="nav__links" aria-label="Main">
    ${NAV.map((item, i) => html`
    <a class="nav__link hover-blur${item.id === page.nav ? ' is-current' : ''}" href="${item.href}"${item.id === page.nav ? ' aria-current="page"' : ''}>
      <span class="nav__num" aria-hidden="true">${pad2(i + 1)}</span>${chars(item.label)}
    </a>`)}
  </nav>
  <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
    <span class="nav__toggle-open">Menu</span><span class="nav__toggle-close">Close</span>
  </button>
</header>

<div class="menu" id="menu" data-menu aria-hidden="true">
  <nav class="menu__links" aria-label="Menu">
    <a class="menu__link" href="/"><span class="menu__num">00</span><span class="menu__label">Home</span></a>
    ${NAV.map((item, i) => html`
    <a class="menu__link${item.id === page.nav ? ' is-current' : ''}" href="${item.href}"><span class="menu__num">${pad2(i + 1)}</span><span class="menu__label">${esc(item.label)}</span></a>`)}
  </nav>
  <div class="menu__foot">
    <a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>
    <span>${site.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(' ')}</span>
  </div>
</div>

<main id="main" class="main">
${page.content}
</main>

${page.footer === false ? '' : footer(ctx)}

<div class="curtain" aria-hidden="true"></div>
${page.id === 'home' ? '<div class="intro-line" aria-hidden="true"></div>' : ''}

<script type="module" src="${ctx.asset('/assets/js/main.js')}"></script>
${site.analytics?.ga4 ? analytics(site.analytics.ga4) : ''}
</body>
</html>
`;
}

function footer(ctx) {
  const { site } = ctx;
  const loc = site.location;
  return html`
<footer class="footer">
  <div class="footer__grid">
    <div class="footer__col footer__col--brand">
      <p class="footer__name">${esc(site.name)}</p>
      <p>${esc(site.role)}<br>${esc(loc.city)}, ${esc(loc.regionName)}</p>
      <p class="footer__clock"><span class="dot" aria-hidden="true"></span><span data-clock data-tz="${esc(loc.timezone)}">--:--</span> in ${esc(loc.city)}</p>
    </div>
    <nav class="footer__col" aria-label="Footer">
      <p class="label">Menu</p>
      <ul>
        ${NAV.map((item) => `<li><a class="hover-blur" href="${item.href}">${chars(item.label)}</a></li>`)}
      </ul>
    </nav>
    <div class="footer__col">
      <p class="label">Follow</p>
      <ul>
        ${site.socials.map((s) => `<li><a class="hover-blur" href="${esc(s.url)}" target="_blank" rel="noopener">${chars(s.label)}<span aria-hidden="true"> &#8599;</span></a></li>`)}
      </ul>
    </div>
    <div class="footer__col">
      <p class="label">Contact</p>
      <ul>
        <li><a class="hover-blur" href="mailto:${esc(site.contact.email)}">${chars(site.contact.email)}</a></li>
        ${site.contact.phone ? `<li><a class="hover-blur" href="tel:${esc(site.contact.phone.replace(/[^+\d]/g, ''))}">${chars(site.contact.phone)}</a></li>` : ''}
        <li><a class="hover-blur" href="/contact/">${chars('Start a project')}</a></li>
      </ul>
    </div>
  </div>
  <div class="footer__base">
    <p>&copy; ${ctx.year} ${esc(site.name)}. All rights reserved. <a class="footer__privacy hover-blur" href="/privacy/">${chars('Privacy')}</a></p>
    <p>Video production &amp; photography in ${esc(loc.city)}, ${esc(loc.region)}</p>
    <a class="hover-blur" href="#main" data-top>${chars('Back to top')}<span aria-hidden="true"> &#8593;</span></a>
  </div>
</footer>`;
}

function analytics(id) {
  // Google Analytics 4, loaded after the page is idle so it never slows the first paint.
  return `<script>
  window.addEventListener('load', function () {
    var start = function () {
      var s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=${esc(id)}';
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', '${esc(id)}');
    };
    ('requestIdleCallback' in window) ? requestIdleCallback(start, { timeout: 4000 }) : setTimeout(start, 2500);
  });
</script>`;
}
