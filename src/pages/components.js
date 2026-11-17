// Small building blocks shared by the page templates.
import { esc, html, pad2 } from '../lib/html.js';
import { SOCIAL_ICONS } from '../lib/icons.js';

/**
 * The small arrows beside links are drawn, not typed. A typed arrow character
 * is missing from the site's fonts, and phones then swap in a coloured emoji.
 * Ayden does not want any emoji on the site.
 */
export const ARROW = '<svg class="arrow" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.3 9.7 9.5 2.5M3.9 2.5h5.6v5.6"/></svg>';
export const ARROW_UP = '<svg class="arrow" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 10.2V2.2M2.6 5.6 6 2.2l3.4 3.4"/></svg>';

/**
 * Split text into per-letter spans so CSS can animate each letter
 * (the blur-in / blur-out hover effect and the intro on the home page).
 * Screen readers get the plain text via the hidden .sr span.
 */
export function chars(text, { start = 0 } = {}) {
  let i = start;
  const words = String(text).split(' ').map((word) => {
    const letters = [...word].map((ch) => {
      const span = `<span class="ch" style="--i:${i}">${esc(ch)}</span>`;
      i += 1;
      return span;
    }).join('');
    return `<span class="w">${letters}</span>`;
  });
  return `<span class="chars" aria-hidden="true">${words.join(' ')}</span><span class="sr">${esc(text)}</span>`;
}

/** Split text into per-word spans (used for the scroll-driven statement). */
export function words(text) {
  return String(text).split(/\s+/).filter(Boolean)
    .map((w, i) => `<span class="word" style="--i:${i}">${esc(w)}</span>`)
    .join(' ');
}

/**
 * A project title for large type. "Name - What it is" keeps its dash on the
 * first line when it wraps, so a line never starts with "- ".
 */
export const titleText = (text) => esc(text).replace(/ - /g, '&nbsp;- ');

/**
 * A short line of capitals spread letter by letter across the full width of
 * its box. The home page uses it under the name, in a box exactly as wide as
 * the name, so the two lines start and end together. Parts are joined by a slash.
 */
export function spread(parts) {
  const list = [].concat(parts).filter(Boolean).map(String);
  const gap = '<i class="spread__gap"> </i>';
  const cells = list
    .map((part) => [...part].map((ch) => (ch === ' ' ? gap : `<i>${esc(ch)}</i>`)).join(''))
    .join(`${gap}<i class="spread__sep">/</i>${gap}`);
  return `<span class="spread" aria-hidden="true">${cells}</span><span class="sr">${esc(list.join(', '))}</span>`;
}

/** The social links as a row of white logos (Instagram, TikTok, YouTube). */
export function socialLinks(site, { cls = '' } = {}) {
  const items = (site.socials || []).map((s) => {
    const icon = SOCIAL_ICONS[String(s.label).toLowerCase()];
    const inner = icon
      ? `<svg class="social__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${icon}"/></svg>`
      : `<span class="social__name">${esc(s.label)}</span>`;
    return `<li><a class="social__link" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}">${inner}</a></li>`;
  });
  return `<ul class="social${cls ? ` ${cls}` : ''}">${items.join('')}</ul>`;
}

/** data-* attributes that tell the front-end scripts how to preview a project. */
export function projectAttrs(p) {
  const attrs = {
    'data-slug': p.slug,
    'data-title': p.title,
    'data-kind': p.kind,
    'data-year': p.year,
    'data-poster': p.poster.src,
    'data-loop': p.loop?.sd || p.loop?.hd || '',
    'data-loop-hd': p.loop?.hd || '',
    'data-yt': p.ytId || '',
    'data-start': p.previewStart || 0,
    'data-orientation': p.orientation,
  };
  return Object.entries(attrs)
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${esc(v)}"`)
    .join(' ');
}

/** Poster image for a project. `small: true` uses the thumbnail copy when there is one. */
export function posterImg(p, { lazy = true, cls = '', small = false } = {}) {
  const src = small && p.poster.thumb ? p.poster.thumb : p.poster.src;
  return `<img${cls ? ` class="${cls}"` : ''} src="${esc(src)}" alt="" width="${p.poster.width}" height="${p.poster.height}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
}

/**
 * Silent preview loop for a project. The file is only fetched when the
 * front-end decides to play it (on hover or when scrolled into view).
 */
export function loopVideo(p, { mode = 'hover' } = {}) {
  const src = p.loop?.sd || p.loop?.hd;
  if (!src) return '';
  return `<video class="loop" muted loop playsinline preload="none" data-loop-video="${mode}" data-src="${esc(src)}" aria-hidden="true" tabindex="-1"></video>`;
}

/** Responsive <img> for a scanned media image ({ src, width, height, sources }). */
export function picture(img, { alt = '', sizes = '100vw', lazy = true, cls = '' } = {}) {
  if (!img) return '';
  const srcset = img.sources.length > 1
    ? ` srcset="${img.sources.map((s) => `${esc(s.src)} ${s.width}w`).join(', ')}" sizes="${sizes}"`
    : '';
  return `<img${cls ? ` class="${cls}"` : ''} src="${esc(img.src)}"${srcset} alt="${esc(alt)}" width="${img.width}" height="${img.height}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
}

/** "(01) Section title ......... link" header used above home sections. */
export function sectionHead({ num, title, id, link }) {
  return html`
    <header class="section-head" data-reveal>
      <p class="section-head__num" aria-hidden="true">(${pad2(num)})</p>
      <h2 class="section-head__title"${id ? ` id="${id}"` : ''}>${esc(title)}</h2>
      ${link && html`<a class="link-arrow hover-blur" href="${link.href}">${chars(link.label)}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a>`}
    </header>`;
}

/**
 * "Before and After": one frame of a film with a line across it. Left of the
 * line is the frame before color grading, right of it the finished grade.
 * Visitors drag the line; the list beside the picture switches to another
 * frame. The pairs are the files in media/grades/ (ctx.grades, see build.js).
 * With none there, nothing is drawn. Behaviour: initGrade() in main.js.
 */
export function gradeSection(ctx, { num, title, text } = {}) {
  const pairs = ctx.grades || [];
  if (!pairs.length) return '';
  const first = pairs[0];
  const alt = (pair) => `A frame from ${pair.project ? pair.project.title : pair.label} after color grading`;
  const size = (img) => `width="${img.width}" height="${img.height}"`;
  return html`
<section class="grade" data-grade aria-labelledby="grade-title">
  ${sectionHead({ num, title, id: 'grade-title' })}
  <div class="grade__body">
    <div class="grade__stage" data-grade-stage data-reveal>
      <img class="grade__img" data-grade-after src="${esc(first.after.src)}" alt="${esc(alt(first))}" ${size(first.after)} loading="lazy" decoding="async" draggable="false">
      <span class="grade__tag grade__tag--after" aria-hidden="true">After</span>
      <div class="grade__before" aria-hidden="true">
        <img class="grade__img" data-grade-before src="${esc(first.before.src)}" alt="" ${size(first.before)} loading="lazy" decoding="async" draggable="false">
        <span class="grade__tag grade__tag--before">Before</span>
      </div>
      <span class="grade__line" aria-hidden="true"><span class="grade__grip"><svg viewBox="0 0 24 24" focusable="false"><path d="M9.5 7l-5 5 5 5M14.5 7l5 5-5 5"/></svg></span></span>
      <input class="grade__range" type="range" min="0" max="100" value="50" aria-label="Before and after color grading. Slide right to show more of the ungraded frame.">
    </div>
    <div class="grade__side">
      ${text ? `<p class="grade__text" data-reveal>${esc(text)}</p>` : ''}
      ${pairs.length > 1 ? html`
      <ol class="grade__list" data-reveal>
        ${pairs.map((pair, i) => html`
        <li><button class="grade__pick${i === 0 ? ' is-active' : ''}" type="button" data-grade-pick data-after="${esc(pair.after.src)}" data-before="${esc(pair.before.src)}" data-alt="${esc(alt(pair))}" data-href="${pair.project ? pair.project.url : ''}" aria-pressed="${i === 0}"><span aria-hidden="true">${pad2(i + 1)}</span><span>${esc(pair.label)}</span></button></li>`)}
      </ol>` : ''}
      <a class="link-arrow hover-blur" href="${first.project ? first.project.url : '/work/'}" data-grade-link${first.project ? '' : ' hidden'}>${chars('See this project')}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a>
    </div>
  </div>
</section>`;
}

/** Big call-to-action block that closes most pages. */
export function cta(ctx, { eyebrow = 'Have a project in mind?', label } = {}) {
  const text = label || ctx.site.home.cta;
  return html`
    <section class="cta" aria-label="Start a project">
      <a class="cta__link" href="/contact/">
        <span class="cta__eyebrow">${esc(eyebrow)}</span>
        <span class="cta__big" data-reveal="rise">${esc(text)}</span>
        <span class="cta__go hover-blur">${chars('Start a project')}<span class="cta__arrow" aria-hidden="true">${ARROW}</span></span>
      </a>
    </section>`;
}
