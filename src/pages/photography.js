// Photography page: a small, curated grid with category filters and a
// full-screen viewer. The photos come straight from media/photos/<category>/.
import { esc, html, pad2 } from '../lib/html.js';
import { picture, cta } from './components.js';
import { breadcrumbLd } from '../lib/seo.js';

export function photographyPage(ctx) {
  const { site, photos } = ctx;
  const cats = ctx.photoCategories.filter((c) => c.count > 0);

  const content = html`
<section class="photos" data-photos>
  <header class="page-head">
    <h1 class="page-title" data-reveal="rise">${esc(site.photography.heading)}<sup>${photos.length}</sup></h1>
    <p class="page-lead" data-reveal>${esc(site.photography.lead)}</p>
    ${cats.length > 1 ? html`
    <div class="filters" role="group" aria-label="Filter photos" data-reveal>
      <button class="filter is-active" type="button" data-filter="all" aria-pressed="true">All<sup>${photos.length}</sup></button>
      ${cats.map((c) => `<button class="filter" type="button" data-filter="${esc(c.folder)}" aria-pressed="false">${esc(c.label)}<sup>${c.count}</sup></button>`)}
    </div>` : ''}
  </header>

  ${photos.length ? html`
  <div class="photos__grid" data-photos-grid>
    ${photos.map((img, i) => html`
    <a class="photo" href="${esc(img.full.src)}" data-photo data-category="${esc(img.category)}" data-label="${esc(img.categoryLabel)}" data-w="${img.full.width}" data-h="${img.full.height}" style="--ar:${(img.width / img.height).toFixed(4)}" aria-label="Open photo ${i + 1}: ${esc(img.alt)}">
      ${picture(img, { alt: img.alt, sizes: '(min-width: 1100px) 32vw, (min-width: 640px) 48vw, 96vw', lazy: i > 2 })}
      <span class="photo__meta" aria-hidden="true"><span>${pad2(i + 1)}</span><span>${esc(img.categoryLabel)}</span></span>
    </a>`)}
  </div>` : html`<p class="photos__empty">Photos are on the way.</p>`}
</section>

<div class="lightbox" data-lightbox role="dialog" aria-modal="true" aria-label="Photo viewer" aria-hidden="true" hidden>
  <button class="lightbox__btn lightbox__close hover-blur" type="button" data-lb-close>Close</button>
  <button class="lightbox__btn lightbox__prev hover-blur" type="button" data-lb-prev aria-label="Previous photo">Prev</button>
  <figure class="lightbox__fig">
    <img data-lb-img alt="">
    <figcaption><span data-lb-count></span><span data-lb-caption></span></figcaption>
  </figure>
  <button class="lightbox__btn lightbox__next hover-blur" type="button" data-lb-next aria-label="Next photo">Next</button>
</div>
${cta(ctx, { eyebrow: 'Need photos for your brand?' })}`;

  return {
    path: '/photography/',
    id: 'photography',
    nav: 'photography',
    title: `Photography | ${site.location.city}, ${site.location.region} Photographer | ${site.seo.titleSuffix}`,
    description: `Photography by ${site.name}, based in ${site.location.city}, ${site.location.regionName}: brand and business, portraits, events and the outdoors.`,
    image: photos[0]?.src,
    jsonld: [
      breadcrumbLd(ctx, [{ name: 'Home', path: '/' }, { name: 'Photography', path: '/photography/' }]),
      photos.length ? {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: `Photography by ${site.name}`,
        url: ctx.abs('/photography/'),
        image: photos.slice(0, 30).map((img) => ({
          '@type': 'ImageObject',
          contentUrl: ctx.abs(img.full.src),
          description: img.alt,
          creator: { '@type': 'Person', name: site.name },
          creditText: site.name,
          copyrightNotice: `© ${site.name}`,
        })),
      } : null,
    ],
    content,
  };
}
