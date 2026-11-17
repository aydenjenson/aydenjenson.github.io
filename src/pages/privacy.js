// Privacy page. The text follows the settings in content/site.json, so it stays
// true when they change: the analytics section only appears while an analytics
// ID is set, and the contact form paragraph depends on whether the form sends
// through Web3Forms or opens the visitor's email app.
import { esc, html } from '../lib/html.js';
import { chars } from './components.js';

const UPDATED = 'November 2026'; // change this when the wording below changes

export function privacyPage(ctx) {
  const { site } = ctx;
  const email = site.contact.email;
  const hasAnalytics = Boolean(site.analytics?.ga4);
  const formSends = Boolean(site.form?.web3formsKey);
  const hasYouTube = ctx.projects.some((p) => p.ytId);
  const out = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${esc(label)}</a>`;

  const blocks = [
    hasAnalytics && {
      title: 'Analytics',
      body: [
        `I use Google Analytics to see how many people visit and which pages they look at. It sets cookies in your browser and collects things like the pages you open, your approximate location (such as your city), the device and browser you use, and how you found the site.`,
        `Google explains how it handles that information in its ${out('https://policies.google.com/privacy', 'privacy policy')}. If you would rather not be counted, Google offers a ${out('https://tools.google.com/dlpage/gaoptout', 'browser add-on that turns Analytics off')}.`,
      ],
    },
    {
      title: 'Contact form',
      body: [
        formSends
          ? `When you send a message through the contact form, the name, email, business and message you enter are delivered to my inbox by Web3Forms, a form service. I use them to reply to you about your project.`
          : `The contact form opens a new message in your own email app, so what you write reaches me as a normal email. I use it to reply to you about your project.`,
      ],
    },
    {
      title: 'Video',
      body: [
        hasYouTube
          ? `Some films here are hosted on YouTube. YouTube's player only loads after you press play, and it uses YouTube's privacy-enhanced address (youtube-nocookie.com). From that point Google's privacy policy applies to the player. The other films, and every preview that plays on its own, are files on this site and involve no one else.`
          : `Every film and preview on this site is a file hosted on the site itself. No outside video player is loaded.`,
      ],
    },
    {
      title: 'Hosting',
      body: [
        `The site is hosted on GitHub Pages. Like any web host, GitHub keeps technical logs that include visitors' IP addresses, for security. See the ${out('https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement', 'GitHub privacy statement')}.`,
      ],
    },
    {
      title: 'In your browser',
      body: [
        `${hasAnalytics ? 'Apart from the analytics cookies, the' : 'The'} site keeps two small notes in your browser tab: whether you have already seen the opening animation, and which layout you picked on the Work page. They never leave your device and are cleared when you close the tab.`,
      ],
    },
    {
      title: 'Questions',
      body: [
        `If you have a question about any of this, or want me to delete a message you sent, write to <a href="mailto:${esc(email)}">${esc(email)}</a>.`,
      ],
    },
  ].filter(Boolean);

  const content = html`
<section class="legal-page">
  <header class="page-head">
    <h1 class="page-title" data-reveal="rise">Privacy</h1>
    <p class="page-lead" data-reveal>This is a portfolio. There are no accounts, no ads and nothing for sale here. This page explains the little information the site does handle.</p>
  </header>
  <div class="legal">
    ${blocks.map((b) => html`
    <div class="legal__block" data-reveal>
      <h2 class="label">${esc(b.title)}</h2>
      ${b.body.map((p) => `<p>${p}</p>`)}
    </div>`)}
    <p class="legal__updated">Last updated ${UPDATED}.</p>
    <p><a class="link-arrow hover-blur" href="/">${chars('Back home')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a></p>
  </div>
</section>`;

  return {
    path: '/privacy/',
    id: 'privacy',
    nav: '',
    title: `Privacy | ${site.seo.titleSuffix}`,
    description: `How ${site.url.replace(/^https?:\/\//, '')} handles visitor information: analytics, the contact form and embedded video.`,
    noindex: true,
    content,
  };
}
