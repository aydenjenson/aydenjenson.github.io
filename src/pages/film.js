// One page per project: a full-screen player, then details and the next project.
//
// Two kinds of playback:
//   "file"    the film is hosted on the site (media/films/<slug>.mp4). It plays
//             on arrival with the site's own minimal controls.
//   "youtube" the film lives on YouTube. The page shows the poster and a play
//             button; pressing it loads the normal YouTube player. Nothing is
//             ever drawn on top of the YouTube player (their terms require that).
import { esc, html, clock, linkify } from '../lib/html.js';
import { chars, titleText, projectAttrs, posterImg, loopVideo, cta, ARROW } from './components.js';
import { breadcrumbLd, videoLd } from '../lib/seo.js';
import { youtubeWatchUrl } from '../lib/youtube.js';

export function filmPage(ctx, p) {
  const { site } = ctx;
  const i = ctx.projects.indexOf(p);
  const prev = ctx.projects[(i - 1 + ctx.projects.length) % ctx.projects.length];
  const next = ctx.projects[(i + 1) % ctx.projects.length];
  const mode = p.film ? 'file' : 'youtube';
  const meta = `${p.kind} / ${p.year}`;

  // Every project shows the same rows in the same order. A row is left out
  // only when the project has nothing for it (a personal film has no client).
  // Anything in "credits" (artist, narration, a note) follows at the end.
  const rows = [
    ['Type', esc(p.kind)],
    p.client && ['Client', linkify(p.client)],
    p.role && ['Role', esc(p.role)],
    p.camera && ['Camera', esc(p.camera)],
    ['Year', p.year],
    p.duration && ['Length', clock(p.duration)],
    ...(p.credits || []).map((c) => [esc(c.label), linkify(c.value)]),
  ].filter(Boolean);

  // Ayden does not take on wedding films any more, so those pages don't invite an inquiry.
  const invite = site.work.categories.find((c) => c.id === p.category)?.inquiries !== false;

  const frame = mode === 'file'
    ? html`
      <video class="film__video" data-film-video src="${esc(p.film.src)}" poster="${esc(p.poster.src)}" playsinline preload="metadata" controls></video>`
    : html`
      ${posterImg(p, { lazy: false, cls: 'film__poster', alt: `Still from ${p.title}` })}
      <div class="film__embed" data-film-embed data-yt="${esc(p.ytId)}" data-title="${esc(p.title)}"></div>
      <button class="film__play" type="button" data-film-play aria-label="Play ${esc(p.title)}">
        <span class="film__play-icon" aria-hidden="true"></span>
        <span class="film__play-label">Play film${p.duration ? ` <span>${clock(p.duration)}</span>` : ''}</span>
      </button>
      <noscript><a class="film__noscript" href="${youtubeWatchUrl(p.ytId)}">Watch &ldquo;${esc(p.title)}&rdquo; on YouTube</a></noscript>`;

  const controls = mode === 'file'
    ? html`
        <div class="film__progress" data-film-progress role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span class="film__progress-buffer" data-film-buffer></span>
          <span class="film__progress-fill" data-film-fill></span>
        </div>
        <div class="film__controls">
          <div class="film__controls-group">
            <button class="hover-blur" type="button" data-film-toggle>${chars('Pause')}</button>
            <span class="film__time" data-film-time>0:00 / ${clock(p.duration)}</span>
          </div>
          <div class="film__controls-group">
            <a class="hover-blur" href="#details" data-film-info>${chars('Info')}</a>
          </div>
          <div class="film__controls-group">
            <button class="hover-blur" type="button" data-film-mute>${chars('Sound on')}</button>
            <button class="hover-blur" type="button" data-film-fs>${chars('Fullscreen')}</button>
            <a class="hover-blur" href="/work/">${chars('Close')}</a>
          </div>
        </div>`
    : html`
        <div class="film__controls">
          <div class="film__controls-group"><a class="hover-blur" href="${prev.url}" rel="prev">${chars('Prev')}</a></div>
          <div class="film__controls-group">
            <a class="hover-blur" href="#details" data-film-info>${chars('Info')}</a>
            <a class="hover-blur" href="/work/">${chars('Close')}</a>
          </div>
          <div class="film__controls-group"><a class="hover-blur" href="${next.url}" rel="next">${chars('Next')}</a></div>
        </div>`;

  const content = html`
<article class="film film--${mode} film--${p.orientation}" data-film data-mode="${mode}" style="--ar:${p.ratio}">
  <div class="film__stage" data-film-stage>
    <div class="film__backdrop" aria-hidden="true"><img src="${esc(p.poster.src)}" alt="" decoding="async"></div>
    <div class="film__frame" data-film-frame>${frame}
    </div>

    <div class="film__ui" data-film-ui>
      <header class="film__head">
        <p class="film__kind">${esc(meta)}</p>
        <h1 class="film__title">${titleText(p.title)}</h1>
      </header>
      ${mode === 'file' ? html`
      <button class="film__sound" type="button" data-film-sound><span class="film__sound-dot" aria-hidden="true"></span>Play with sound</button>
      <a class="film__nav film__nav--prev hover-blur" href="${prev.url}" rel="prev">${chars('Prev project')}</a>
      <a class="film__nav film__nav--next hover-blur" href="${next.url}" rel="next">${chars('Next project')}</a>` : ''}
      <div class="film__bar">${controls}
      </div>
    </div>
  </div>

  <section class="details" id="details" aria-label="About this project">
    <div class="details__main">
      <p class="label">${esc(p.categoryLabel)}</p>
      <h2 class="details__title" data-reveal="rise">${titleText(p.title)}</h2>
      ${p.description ? `<p class="details__text" data-reveal>${esc(p.description)}</p>` : ''}
      ${p.ytId || invite ? html`
      <p class="details__links" data-reveal>
        ${p.ytId ? `<a class="link-arrow hover-blur" href="${youtubeWatchUrl(p.ytId)}" target="_blank" rel="noopener">${chars('Watch on YouTube')}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a>` : ''}
        ${invite ? `<a class="link-arrow hover-blur" href="/contact/">${chars('Create something like this')}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a>` : ''}
      </p>` : ''}
    </div>
    <dl class="details__credits" data-reveal>
      ${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)}
    </dl>
  </section>

  <a class="next next--${next.orientation}" href="${next.url}" ${projectAttrs(next)}>
    <span class="next__media" aria-hidden="true">
      ${posterImg(next, { cls: 'next__img' })}
      ${loopVideo(next, { mode: 'view' })}
    </span>
    <span class="next__eyebrow">Next project</span>
    <span class="next__title">${titleText(next.title)}</span>
    <span class="next__kind">${esc(next.kind)} / ${next.year}</span>
  </a>
</article>
${cta(ctx)}`;

  // Search results show roughly 60 characters of title and 155 of description.
  // The description is Ayden's own sentence about the project plus a credit. When
  // that is too long the credit is shortened before his sentence is given up. A
  // project can also carry a shorter sentence written for search ("seoDescription"
  // in projects.json); the sentence shown on the page itself never changes.
  const place = `${site.location.city}, ${site.location.region}`;
  const credit = `${p.kind} by ${site.name}, ${place}.`;
  const shortCredit = `By ${site.name}, ${place}.`;
  const firstSentence = (p.description || '').split(/(?<=[.!?])\s+/)[0] || '';
  const description = [
    p.seoDescription && `${p.seoDescription} ${shortCredit}`,
    p.description && `${p.description} ${credit}`,
    firstSentence && `${firstSentence} ${credit}`,
    p.description && `${p.description} ${shortCredit}`,
    firstSentence && `${firstSentence} ${shortCredit}`,
  ]
    .filter(Boolean)
    .find((text) => text.length <= 155)
    || `${p.title}: ${p.kind.toLowerCase()} by ${site.name}, videographer and cinematographer in ${place}.`;
  // The fullest version that fits; a long "Name - What it is" title falls back to the name alone.
  // The type is left out when the title already says it ("2025 Showreel", "OxCB - Event Promotion").
  const shortName = p.title.split(' - ')[0];
  const says = p.title.toLowerCase().includes(p.kind.toLowerCase());
  const titles = [
    !says && `${p.title} | ${p.kind} by ${site.seo.titleSuffix}`,
    `${p.title} | ${site.seo.titleSuffix}`,
    !says && `${shortName} | ${p.kind} by ${site.seo.titleSuffix}`,
    `${shortName} | ${site.seo.titleSuffix}`,
  ].filter(Boolean);
  const title = titles.find((t) => t.length <= 60) || titles[titles.length - 1];

  return {
    path: p.url,
    id: 'film',
    nav: 'work',
    title,
    description,
    image: p.poster.src,
    ogType: 'video.other',
    preload: [{ href: p.poster.src, as: 'image', fetchpriority: 'high' }],
    jsonld: [
      videoLd(ctx, p),
      breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'Work', path: '/work/' }, { name: p.title, path: p.url }]),
    ],
    content,
  };
}
