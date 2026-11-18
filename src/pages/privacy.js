// Privacy page. The text follows the settings in content/site.json, so it stays
// true when they change: the analytics section only appears while an analytics
// ID is set, and the contact form paragraph depends on whether the form sends
// through Web3Forms or opens the visitor's email app.
import { esc, html } from '../lib/html.js';
import { chars, ARROW } from './components.js';

const UPDATED = 'November 2026'; // change this when the wording below changes

export function privacyPage(ctx) {
  const { site } = ctx;
  const email = site.contact.email;
  const hasAnalytics = Boolean(site.analytics?.ga4);
  const formSends = Boolean(site.form?.web3formsKey);
  const hasYouTube = ctx.projects.some((p) => p.ytId);
  const out = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${esc(label)}</a>`;

  // Ayden asked for this page to be short, professional and free of filler.
  // Each block says what is collected, by whom, and why, and nothing else.
  const blocks = [
    hasAnalytics && {
      title: 'Analytics',
      body: [
        `This site uses Google Analytics to measure traffic. It sets cookies and collects usage data: pages viewed, approximate location, device and browser type, and referring site. Google processes this data under its ${out('https://policies.google.com/privacy', 'Privacy Policy')}. To opt out, install the ${out('https://tools.google.com/dlpage/gaoptout', 'Google Analytics opt-out add-on')}.`,
      ],
    },
    {
      title: 'Contact form',
      body: [
        formSends
          ? `Messages sent through the contact form are delivered by Web3Forms. The name, email address, business name, and message you provide are used only to respond to your inquiry.`
          : `The contact form opens a message in your own email application. The information you send is used only to respond to your inquiry.`,
      ],
    },
    {
      title: 'Video',
      body: [
        hasYouTube
          ? `Some films are hosted on YouTube. The YouTube player loads only after you press play and uses YouTube's privacy-enhanced mode (youtube-nocookie.com). Google's Privacy Policy applies once the player loads. All other video is served directly from this site.`
          : `All video is served directly from this site. No third-party video player is used.`,
      ],
    },
    {
      title: 'Hosting',
      body: [
        `This site is hosted on GitHub Pages. GitHub may log visitor IP addresses for security purposes, as described in the ${out('https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement', 'GitHub Privacy Statement')}.`,
      ],
    },
    {
      title: 'Browser storage',
      body: [
        `The site stores two settings in your browser for the current session: whether the opening animation has played, and your layout choice on the Work page. Neither leaves your device.`,
      ],
    },
    {
      title: 'Your information',
      body: [
        `Personal information is used only for the purposes described above and is never sold. To ask a question or request deletion of a message you sent, email <a href="mailto:${esc(email)}">${esc(email)}</a>.`,
      ],
    },
  ].filter(Boolean);

  const content = html`
<section class="legal-page">
  <header class="page-head">
    <h1 class="page-title" data-reveal="rise">Privacy</h1>
    <p class="page-lead" data-reveal>This is a portfolio. There are no accounts, no ads, and nothing for sale here. This page explains the little information the site does handle.</p>
  </header>
  <div class="legal">
    ${blocks.map((b) => html`
    <div class="legal__block" data-reveal>
      <h2 class="label">${esc(b.title)}</h2>
      ${b.body.map((p) => `<p>${p}</p>`)}
    </div>`)}
    <p class="legal__updated">Last updated ${UPDATED}.</p>
    <p><a class="link-arrow hover-blur" href="/">${chars('Back home')}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a></p>
  </div>
</section>`;

  return {
    path: '/privacy/',
    id: 'privacy',
    nav: '',
    title: `Privacy | ${site.seo.titleSuffix}`,
    description: `How ${site.url.replace(/^https?:\/\//, '')} handles visitor information: analytics, the contact form, and embedded video.`,
    noindex: true,
    content,
  };
}
