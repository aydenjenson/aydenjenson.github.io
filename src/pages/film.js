// One page per project: a full-screen player, then details and the next project.
//
// Two kinds of playback:
//   "file"    the film is hosted on the site (media/films/<slug>.mp4). It plays
//             on arrival with the site's own minimal controls.
//   "youtube" the film lives on YouTube. The page shows the poster and a play
//             button; pressing it loads the normal YouTube player. Nothing is
//             ever drawn on top of the YouTube player (their terms require that).
import { esc, html, clock } from '../lib/html.js';
import { chars, projectAttrs, posterImg, loopVideo, cta } from './components.js';
import { breadcrumbLd, videoLd } from '../lib/seo.js';
import { youtubeWatchUrl } from '../lib/youtube.js';

export function filmPage(ctx, p) {
  const { site } = ctx;
  const i = ctx.projects.indexOf(p);
  const prev = ctx.projects[(i - 1 + ctx.projects.length) % ctx.projects.length];
  const next = ctx.projects[(i + 1) % ctx.projects.length];
  const mode = p.film ? 'file' : 'youtube';
  const meta = `${p.kind} / ${p.year}`;

  const frame = mode === 'file'
    ? html`
      <video class="film__video" data-film-video src="${esc(p.film.src)}" poster="${esc(p.poster.src)}" playsinline preload="metadata" controls></video>`
    : html`
      ${posterImg(p, { lazy: false, cls: 'film__poster' })}
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
        <h1 class="film__title">${esc(p.title)}</h1>
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
      <h2 class="details__title" data-reveal="rise">${esc(p.title)}</h2>
      ${p.description ? `<p class="details__text" data-reveal>${esc(p.description)}</p>` : ''}
      <p class="details__links" data-reveal>
        ${p.ytId ? `<a class="link-arrow hover-blur" href="${youtubeWatchUrl(p.ytId)}" target="_blank" rel="noopener">${chars('Watch on YouTube')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a>` : ''}
        <a class="link-arrow hover-blur" href="/contact/">${chars('Start a project like this')}<span class="link-arrow__icon" aria-hidden="true">&#8599;</span></a>
      </p>
    </div>
    <dl class="details__credits" data-reveal>
      <div><dt>Type</dt><dd>${esc(p.kind)}</dd></div>
      <div><dt>Year</dt><dd>${p.year}</dd></div>
      ${p.duration ? `<div><dt>Length</dt><dd>${clock(p.duration)}</dd></div>` : ''}
      ${(p.credits || []).map((c) => `<div><dt>${esc(c.label)}</dt><dd>${esc(c.value)}</dd></div>`)}
    </dl>
  </section>

  <a class="next next--${next.orientation}" href="${next.url}" ${projectAttrs(next)}>
    <span class="next__media" aria-hidden="true">
      ${posterImg(next, { cls: 'next__img' })}
      ${loopVideo(next, { mode: 'view' })}
    </span>
    <span class="next__eyebrow">Next project</span>
    <span class="next__title">${esc(next.title)}</span>
    <span class="next__kind">${esc(next.kind)} / ${next.year}</span>
  </a>
</article>
${cta(ctx)}`;

  // Search results show roughly 60 characters of title and 160 of description.
  const credit = `${p.kind} by ${site.name}, ${site.location.city}, ${site.location.region}.`;
  const firstSentence = (p.description || '').split(/(?<=[.!?])\s+/)[0] || '';
  const description = [p.description, firstSentence]
    .filter(Boolean)
    .map((text) => `${text} ${credit}`)
    .find((text) => text.length <= 160)
    || `${p.title}: ${p.kind.toLowerCase()} by ${site.name}, videographer and cinematographer in ${site.location.city}, ${site.location.region}.`;
  const longTitle = `${p.title} | ${p.kind} by ${site.seo.titleSuffix}`;
  const title = longTitle.length <= 65 ? longTitle : `${p.title} | ${site.seo.titleSuffix}`;

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
