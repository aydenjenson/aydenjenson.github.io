// Structured data (JSON-LD) that tells Google who Ayden is, where he works and
// what each page contains. Everything is generated from content/site.json and
// content/projects.json, so there is nothing to keep in sync by hand.
import { isoDuration } from './html.js';
import { youtubeEmbedUrl } from './youtube.js';

const id = (ctx, hash) => `${ctx.site.url}/#${hash}`;

/** The business: a local video production / photography service in Mankato. */
export function businessLd(ctx) {
  const { site } = ctx;
  const loc = site.location;
  return clean({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': id(ctx, 'business'),
    name: site.name,
    alternateName: `${site.name} ${site.role}`,
    description: site.seo.description,
    url: `${site.url}/`,
    image: ctx.abs('/og.jpg'),
    email: site.contact.email || undefined,
    telephone: site.contact.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: loc.city,
      addressRegion: loc.region,
      addressCountry: loc.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: loc.latitude, longitude: loc.longitude },
    areaServed: [
      { '@type': 'City', name: `${loc.city}, ${loc.region}` },
      { '@type': 'State', name: loc.regionName },
    ],
    founder: { '@id': id(ctx, 'person') },
    sameAs: site.socials.map((s) => s.url),
    knowsAbout: ['Videography', 'Cinematography', 'Video production', 'Commercial video', 'Brand films', 'Social media video', 'Photography', 'Color grading'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Video production and photography services',
      itemListElement: site.services.items.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.summary, areaServed: `${loc.city}, ${loc.region}` },
      })),
    },
  });
}

export function personLd(ctx) {
  const { site } = ctx;
  const loc = site.location;
  const portrait = ctx.media.about.portrait;
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': id(ctx, 'person'),
    name: site.name,
    jobTitle: site.role,
    description: site.about.lead,
    url: `${site.url}/about/`,
    image: portrait ? ctx.abs(portrait.src) : undefined,
    email: site.contact.email || undefined,
    homeLocation: { '@type': 'Place', name: `${loc.city}, ${loc.regionName}` },
    worksFor: { '@id': id(ctx, 'business') },
    sameAs: site.socials.map((s) => s.url),
  });
}

export function websiteLd(ctx) {
  const { site } = ctx;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': id(ctx, 'website'),
    name: site.name,
    url: `${site.url}/`,
    inLanguage: 'en-US',
    publisher: { '@id': id(ctx, 'business') },
  };
}

/** One per project page. Google needs name, thumbnailUrl and uploadDate. */
export function videoLd(ctx, p) {
  const { site } = ctx;
  return clean({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: p.title,
    description: p.description || `${p.title}, ${p.kind.toLowerCase()} by ${site.name}.`,
    thumbnailUrl: [ctx.abs(p.poster.src)],
    uploadDate: p.date ? `${p.date}T12:00:00-06:00` : undefined,
    duration: p.duration ? isoDuration(p.duration) : undefined,
    contentUrl: p.film ? ctx.abs(p.film.src) : undefined,
    embedUrl: !p.film && p.ytId ? youtubeEmbedUrl(p.ytId).replace('-nocookie', '') : undefined,
    creator: { '@id': id(ctx, 'person') },
    publisher: { '@id': id(ctx, 'business') },
    url: ctx.abs(p.url),
  });
}

export function breadcrumbLd(ctx, crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: ctx.abs(c.path),
    })),
  };
}

export function faqLd(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** List of all projects, used on the work page. */
export function workListLd(ctx) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Video work by ${ctx.site.name}`,
    itemListElement: ctx.projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: ctx.abs(p.url),
      name: p.title,
    })),
  };
}

/** Drop undefined values and empty arrays so the output stays tidy. */
function clean(obj) {
  if (Array.isArray(obj)) return obj.map(clean);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v) && v.length === 0) continue;
      out[k] = clean(v);
    }
    return out;
  }
  return obj;
}
