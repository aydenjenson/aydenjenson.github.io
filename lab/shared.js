// Shared by every design options page (see lab/pages.js).
import { esc, html } from '../src/lib/html.js';

/**
 * Wraps a page so it is preview-only: marked noindex (which also keeps it out
 * of the sitemap), with the lab stylesheet and script. An options page that
 * needs its own files lists them in `styles` and `scripts` (paths under
 * /lab-assets/, which is lab/assets/ in the project). `head` is for anything
 * else that belongs in <head>, such as a font stylesheet used only in the preview.
 */
export function labPage({ styles = [], scripts = [], head = '', ...page }) {
  const links = ['/lab-assets/lab.css', ...styles].map((href) => `<link rel="stylesheet" href="${href}">`);
  const tags = ['/lab-assets/lab.js', ...scripts].map((src) => `<script type="module" src="${src}"></script>`);
  return {
    id: 'lab',
    nav: '',
    noindex: true,
    description: 'Design options. Local preview only.',
    ...page,
    head: [...links, head].filter(Boolean).join('\n'),
    content: `${page.content}\n${tags.join('\n')}`,
  };
}

/** One titled block on an options page: a code letter, a heading, a short lead and the options. */
export function section({ id, letter, title, lead, body }) {
  return html`
<section class="lab-sec" id="${id}" aria-labelledby="${id}-title">
  <header class="lab-sec__head">
    <p class="lab-sec__letter" aria-hidden="true">${letter}</p>
    <h2 class="section-title" id="${id}-title">${esc(title)}</h2>
    <p class="lab-sec__lead">${lead}</p>
  </header>
  ${body}
</section>`;
}
