// Font options for headings and for the name on the home screen (revision A11). Preview only.
// Returns the pages to add to the lab build; lab/pages.js calls this.
//
//   /lab/fonts/            the options page (serif samples, name lockups, licence notes)
//   /lab/fonts/name-N/     the real home page with name option N applied (N = 1 to 7)
//
// Only this preview loads fonts from the internet (Google Fonts and Fontshare). The real
// site would host its own .woff2 files, like Inter Tight and Instrument Serif today.
import { esc } from '../src/lib/html.js';
import { labPage } from './shared.js';
import { homePage } from '../src/pages/home.js';

const GF = 'https://fonts.googleapis.com/css2?family=';
const FS = 'https://api.fontshare.com/v2/css?f[]=';
const OFL_NOTE = 'Yes. The SIL Open Font License 1.1 allows the font to be used, embedded and redistributed, which includes serving it from your own site.';
const FFL_NOTE = 'Yes, as the downloaded files, unchanged. Section 01 says "You may self-host the Font Software on your own servers or infrastructure for use on your own websites and applications, including through standard webfont technologies such as CSS @font-face." Section 02 also says you may not modify the font "including ... subsetting, format conversion" without written consent, so the files must be used exactly as Fontshare supplies them (its download includes WOFF2).';
const FFL_URL = 'https://www.fontshare.com/licenses/itf-ffl';
const ofl = (dir) => `https://github.com/google/fonts/blob/main/ofl/${dir}/OFL.txt`;
const SIZE = 'size not checked';

// Each font: key, family (CSS name), weight, stretch, css (stylesheet that loads it on this preview page only).
const CURRENT_SERIF = {
  label: 'current', name: 'Instrument Serif', family: "'Instrument Serif'", weight: 400, css: '',
  maker: 'the OFL file credits "The Instrument Serif Project Authors"',
  licence: 'SIL Open Font License 1.1', licenceUrl: ofl('instrumentserif'), self: OFL_NOTE,
  load: 'Already on the site: two self-hosted .woff2 files (regular and italic), no outside requests.', size: 'already on the site',
};

const SERIFS = [
  {
    name: 'Gloock', family: "'Gloock'", weight: 400, css: `${GF}Gloock&display=swap`, ls: '-0.005em',
    kind: 'Sharp, high-contrast display serif. Dramatic thick and thin strokes, the most "magazine cover" of the set.',
    maker: 'the OFL file credits "The Gloock Project Authors"', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('gloock'), self: OFL_NOTE,
    load: 'Self-hosted .woff2. One file (a single regular weight).', size: SIZE,
  },
  {
    name: 'Newsreader', family: "'Newsreader'", weight: 400, css: `${GF}Newsreader:opsz,wght@6..72,400&display=swap`, ls: '-0.015em',
    kind: 'Old-style book serif, warm and readable. It redraws itself for large sizes (optical size), so headings look finer than text.',
    maker: 'the OFL file credits "The Newsreader Project Authors" (project hosted by Production Type)', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('newsreader'), self: OFL_NOTE,
    load: 'Self-hosted .woff2. One variable file covers every weight and optical size; add a second file only for italic.', size: SIZE,
  },
  {
    name: 'Young Serif', family: "'Young Serif'", weight: 400, css: `${GF}Young+Serif&display=swap`, ls: '-0.01em',
    kind: 'Soft, sturdy modern serif with a friendly 1970s feel. Heavier and rounder than Instrument Serif.',
    maker: 'the OFL file credits "The Young Serif Project Authors" (project hosted by Noirblanc Rouge)', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('youngserif'), self: OFL_NOTE,
    load: 'Self-hosted .woff2. One file (a single regular weight).', size: SIZE,
  },
  {
    name: 'Libre Caslon Condensed', family: "'Libre Caslon Condensed'", weight: 400, css: `${GF}Libre+Caslon+Condensed:wght@400&display=swap`, ls: '0',
    kind: 'Narrow serif built on Caslon, the classic film-poster and book face. Fits long titles in a small space.',
    maker: 'the OFL file credits "The Libre Caslon Condensed Project Authors"', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('librecasloncondensed'), self: OFL_NOTE,
    load: 'Self-hosted .woff2. One file for regular (the font also comes in heavier weights).', size: SIZE,
  },
  {
    name: 'Gambarino', family: "'Gambarino'", weight: 400, css: `${FS}gambarino@400&display=swap`, ls: '-0.01em',
    kind: 'Display serif with personality: sharp angled terminals and a slightly quirky rhythm. Not seen on many sites.',
    maker: 'Theo Guillard, published by Indian Type Foundry on Fontshare', licence: 'ITF Free Font License (Fontshare)', licenceUrl: FFL_URL, self: FFL_NOTE,
    load: 'Self-hosted .woff2 as downloaded from Fontshare. One file (it has one weight, regular).', size: SIZE,
  },
  {
    name: 'Sentient', family: "'Sentient'", weight: 500, css: `${FS}sentient@500&display=swap`, ls: '-0.015em',
    kind: 'Sharp, light-contrast editorial serif, crisp and slightly cool. Weights from extralight to bold, so it can be tuned.',
    maker: 'Noopur Choksi, published by Indian Type Foundry on Fontshare', licence: 'ITF Free Font License (Fontshare)', licenceUrl: FFL_URL, self: FFL_NOTE,
    load: 'Self-hosted .woff2 as downloaded from Fontshare. One file for the medium weight shown here (two if you also want regular).', size: SIZE,
  },
  {
    name: 'Marcellus', family: "'Marcellus'", weight: 400, css: `${GF}Marcellus&display=swap`, ls: '0.005em',
    kind: 'Flared serif based on classical Roman capitals, close to the lettering on old film titles. Calm and cinematic.',
    maker: 'Brian J. Bonislawsky, Astigmatic', licence: 'SIL Open Font License 1.1 (declares the Reserved Font Name "Marcellus")', licenceUrl: ofl('marcellus'),
    self: OFL_NOTE + ' Because the name "Marcellus" is reserved, a modified copy (for example a subset) may not keep that name; the unmodified file has no such issue.',
    load: 'Self-hosted .woff2. One file (a single regular weight).', size: SIZE,
  },
];

const CURRENT_NAME = {
  label: 'current', name: 'Inter Tight 600, capitals', family: "'Inter Tight'", weight: 600, stretch: '100%', ls: '-0.01em', transform: 'uppercase', text: 'AYDEN JENSON', css: '',
  maker: 'the OFL file credits "The Inter Project Authors"', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('intertight'), self: OFL_NOTE,
  load: 'Already on the site: one self-hosted variable .woff2, no outside requests.', size: 'already on the site',
};

const NAMES = [
  {
    name: 'Archivo Expanded 700, capitals', family: "'Archivo'", weight: 700, stretch: '125%', ls: '0.02em', transform: 'uppercase', text: 'AYDEN JENSON', css: `${GF}Archivo:wdth,wght@125,700&display=swap`,
    kind: 'Wide, steady grotesque. Calm and confident; the wide letters make a long, low name.',
    maker: 'the OFL file credits "The Archivo Project Authors" (project hosted by Omnibus-Type)', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('archivo'), self: OFL_NOTE,
    load: 'Self-hosted .woff2. One file: a variable font with width and weight, or a single static bold-expanded cut.', size: SIZE,
  },
  {
    name: 'Big Shoulders Display 700, capitals', family: "'Big Shoulders Display'", weight: 700, stretch: '100%', ls: '0.03em', transform: 'uppercase', text: 'AYDEN JENSON', css: `${GF}Big+Shoulders+Display:wght@700&display=swap`,
    kind: 'Condensed, poster-like capitals. Because every name here is set to the same width, this one comes out tall.',
    maker: 'the OFL file credits "The Big Shoulders Project Authors" (project hosted by Xo Type Co.)', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('bigshouldersdisplay'), self: OFL_NOTE,
    load: 'Self-hosted .woff2. One file for bold (the family is also a variable font).', size: SIZE,
  },
  {
    name: 'Clash Display 600, capitals', family: "'Clash Display'", weight: 600, stretch: '100%', ls: '0.01em', transform: 'uppercase', text: 'AYDEN JENSON', css: `${FS}clash-display@600&display=swap`,
    kind: 'Sans display face with sharp, slightly tight shapes. Closest to the current look but with more character.',
    maker: 'Indian Type Foundry, published on Fontshare', licence: 'ITF Free Font License (Fontshare)', licenceUrl: FFL_URL, self: FFL_NOTE,
    load: 'Self-hosted .woff2 as downloaded from Fontshare. One file for the semibold weight.', size: SIZE,
  },
  {
    name: 'Syne 700, capitals', family: "'Syne'", weight: 700, stretch: '100%', ls: '0', transform: 'uppercase', text: 'AYDEN JENSON', css: `${GF}Syne:wght@700&display=swap`,
    kind: 'Art-gallery sans with wide, odd proportions that get wider as the weight rises. Distinctive without being decorative.',
    maker: 'the OFL file credits "The Syne Project Authors" (project hosted by Bonjour Monde)', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('syne'), self: OFL_NOTE,
    load: 'Self-hosted .woff2. One file for bold (the family is also a variable font).', size: SIZE,
  },
  {
    name: 'Bodoni Moda 500, capitals', family: "'Bodoni Moda'", weight: 500, stretch: '100%', ls: '0.02em', transform: 'uppercase', text: 'AYDEN JENSON', css: `${GF}Bodoni+Moda:opsz,wght@6..96,500&display=swap`,
    kind: 'Serif capitals with razor-thin hairlines, fashion and film-title style. At small sizes the hairlines can fade.',
    maker: 'the OFL file credits "The Bodoni Moda Project Authors" (project hosted by Indestructible Type)', licence: 'SIL Open Font License 1.1', licenceUrl: ofl('bodonimoda'), self: OFL_NOTE,
    load: 'Self-hosted .woff2. One variable file (weight and optical size).', size: SIZE,
  },
  {
    name: 'Gambarino, upper and lower case', family: "'Gambarino'", weight: 400, stretch: '100%', ls: '-0.01em', transform: 'none', text: 'Ayden Jenson', css: `${FS}gambarino@400&display=swap`,
    kind: 'The same display serif as heading option 5, with the name in normal capitalisation. Warmer and more personal than capitals.',
    maker: 'Theo Guillard, published by Indian Type Foundry on Fontshare', licence: 'ITF Free Font License (Fontshare)', licenceUrl: FFL_URL, self: FFL_NOTE,
    load: 'Self-hosted .woff2 as downloaded from Fontshare. One file (one weight). Shared with heading option 5 if you pick both.', size: SIZE,
  },
  {
    name: 'Marcellus, capitals', family: "'Marcellus'", weight: 400, stretch: '100%', ls: '0.04em', transform: 'uppercase', text: 'AYDEN JENSON', css: `${GF}Marcellus&display=swap`,
    kind: 'Classical Roman-style capitals with flared ends, like the title card of an old feature film. Shared with heading option 7 if you pick both.',
    maker: 'Brian J. Bonislawsky, Astigmatic', licence: 'SIL Open Font License 1.1 (declares the Reserved Font Name "Marcellus")', licenceUrl: ofl('marcellus'),
    self: OFL_NOTE + ' Because the name "Marcellus" is reserved, a modified copy (for example a subset) may not keep that name; the unmodified file has no such issue.',
    load: 'Self-hosted .woff2. One file (a single regular weight).', size: SIZE,
  },
];

const SAMPLE_LARGE = ['Brand Films', 'Commercials', 'Social Media'];
const SAMPLE_SECTION = 'Selected Work';
const SAMPLE_TAGLINE = 'Create content WORTH watching.';
const SAMPLE_PROJECT = 'Reborn Legacy Tattoo - Social Media Promo';
const SAMPLE_NUMERALS = '2017 & 2026, Mankato, MN';
const NAME_LINE = 'CINEMATOGRAPHER | MANKATO, MN';

const fontStyle = (f) => `font-family:${f.family}, 'Times New Roman', serif;font-weight:${f.weight};letter-spacing:${f.ls || '0'}`;

function info(f) {
  return `
  <dl class="fo-info">
    <div><dt>Kind</dt><dd>${esc(f.kind || 'The heading font the site uses today.')}</dd></div>
    <div><dt>Designer or publisher</dt><dd>${esc(f.maker)}</dd></div>
    <div><dt>Licence</dt><dd><a href="${esc(f.licenceUrl)}" target="_blank" rel="noopener">${esc(f.licence)}</a></dd></div>
    <div><dt>Self-hosting allowed</dt><dd>${esc(f.self)}</dd></div>
    <div><dt>How it would load</dt><dd>${esc(f.load)} File size: ${esc(f.size)}.</dd></div>
  </dl>`;
}

function serifPanel(f, tone) {
  return `
    <div class="fo-panel fo-panel--${tone}" style="${esc(fontStyle(f))}">
      <p class="fo-s-tag">${tone === 'dark' ? 'Dark' : 'Light'}</p>
      <p class="fo-s-large">${SAMPLE_LARGE.map((t) => `<span>${esc(t)}</span>`).join('')}</p>
      <h3 class="fo-s-section">${esc(SAMPLE_SECTION)}</h3>
      <p class="fo-s-tagline">${esc(SAMPLE_TAGLINE)}</p>
      <p class="fo-s-project">${esc(SAMPLE_PROJECT)}</p>
      <p class="fo-s-num">${esc(SAMPLE_NUMERALS)}</p>
    </div>`;
}

function serifOption(f, i) {
  const label = f.label === 'current' ? 'A11 serif: current' : `A11 serif: option ${i}`;
  return `
<article class="fo-opt" id="serif-${f.label === 'current' ? 'current' : i}">
  <header class="fo-opt__head"><p class="fo-code">${esc(label)}</p><h3 class="fo-opt__name">${esc(f.name)}</h3></header>
  <div class="fo-pair">${serifPanel(f, 'dark')}${serifPanel(f, 'light')}</div>
  ${info(f)}
</article>`;
}

function lockup(f, tone, bg) {
  const line = [...NAME_LINE].map((c) => (c === ' ' ? '<i class="fo-sp"></i>' : `<span>${esc(c)}</span>`)).join('');
  return `
    <div class="fo-panel fo-panel--${tone} fo-panel--lock"${tone === 'dark' ? ` style="--still:url('${esc(bg)}')"` : ''}>
      <p class="fo-s-tag">${tone === 'dark' ? 'Dark, over a still' : 'Light'}</p>
      <div class="fo-lock" data-fo-lock data-family="${esc(f.family.replace(/'/g, ''))}" data-weight="${f.weight}" data-stretch="${esc(f.stretch)}">
        <span class="fo-lock__name" style="font-family:${esc(f.family)}, 'Helvetica Neue', Arial, sans-serif;font-weight:${f.weight};font-stretch:${esc(f.stretch)};letter-spacing:${esc(f.ls)};text-transform:${f.transform}">${esc(f.text)}</span>
        <span class="fo-lock__line" aria-label="Cinematographer, Mankato, MN">${line}</span>
      </div>
    </div>`;
}

function nameOption(f, i, bg) {
  const isCurrent = f.label === 'current';
  const label = isCurrent ? 'A11 name: current' : `A11 name: option ${i}`;
  return `
<article class="fo-opt" id="name-${isCurrent ? 'current' : i}">
  <header class="fo-opt__head"><p class="fo-code">${esc(label)}</p><h3 class="fo-opt__name">${esc(f.name)}</h3></header>
  <div class="fo-pair">${lockup(f, 'dark', bg)}${lockup(f, 'light', bg)}</div>
  ${isCurrent ? '' : `<p class="fo-live"><a class="fo-btn" href="/lab/fonts/name-${i}/">See it on the home screen</a></p>`}
  ${info(f)}
</article>`;
}

function optionsPage(ctx) {
  const reel = ctx.projects.find((p) => p.slug === ctx.site.home.reelProject) || ctx.projects[0];
  const bg = reel ? (reel.loop?.still || reel.poster.src) : '';
  const allCss = [...new Set([...SERIFS, ...NAMES].map((f) => f.css).filter(Boolean))];
  const head = allCss.map((href) => `<link rel="stylesheet" href="${esc(href)}">`).join('\n');

  const content = `
<div class="lab fo" data-fo-page>
  <header class="page-head">
    <p class="label">Preview only. Nothing on this page is on your live site.</p>
    <h1 class="page-title">Font options</h1>
    <p class="page-lead">Your real site hosts its own font files, so visitors never ask anyone else's server for a font. Whichever you choose costs one or two small files on your site, the same way Instrument Serif and Inter Tight work now. Only this preview page loads the fonts from the internet (Google Fonts and Fontshare), so it needs an internet connection to show them. Tell me the codes you like, for example "serif 3" and "name 5".</p>
    <ul class="fo-jump">
      <li><a href="#serif">Part 1: the heading serif</a></li>
      <li><a href="#name">Part 2: your name on the home screen</a></li>
      <li><a href="#open">Open questions</a></li>
    </ul>
  </header>

  <section class="lab-sec" id="serif" aria-labelledby="serif-title">
    <header class="lab-sec__head">
      <p class="lab-sec__letter" aria-hidden="true">A11 / Part 1</p>
      <h2 class="section-title" id="serif-title">The heading serif</h2>
      <p class="lab-sec__lead">Seven alternatives to Instrument Serif, each with a different character, shown on the site's dark background and on an off-white one. Every sample set is the same. The current font comes first for comparison.</p>
    </header>
    <div class="fo-list">
      ${serifOption(CURRENT_SERIF, 0)}
      ${SERIFS.map((f, i) => serifOption(f, i + 1)).join('')}
    </div>
  </section>

  <section class="lab-sec" id="name" aria-labelledby="name-title">
    <header class="lab-sec__head">
      <p class="lab-sec__letter" aria-hidden="true">A11 / Part 2</p>
      <h2 class="section-title" id="name-title">Your name on the home screen</h2>
      <p class="lab-sec__lead">Every name below is set to exactly the same width, so only the shape of the letters differs. The small line under it is spread to the same width, as on the real home screen. Under each one is a link that opens the real home page with that font applied.</p>
    </header>
    <div class="fo-list">
      ${nameOption(CURRENT_NAME, 0, bg)}
      ${NAMES.map((f, i) => nameOption(f, i + 1, bg)).join('')}
    </div>
  </section>

  <section class="lab-sec fo-open" id="open" aria-labelledby="open-title">
    <header class="lab-sec__head">
      <p class="lab-sec__letter" aria-hidden="true">Notes</p>
      <h2 class="section-title" id="open-title">Open questions</h2>
    </header>
    <ul class="fo-notes">
      <li>The three Fontshare fonts used here (Gambarino, Sentient, Clash Display) fall under the ITF Free Font License, which lets you host the files yourself but forbids changing them, including cutting them down to fewer characters. They would be used exactly as downloaded, so they may be a little larger than a trimmed Google font. File sizes have not been checked.</li>
      <li>Marcellus declares a Reserved Font Name. Used unchanged it is fine; if the files were ever trimmed or converted they would have to be renamed. Say if you want that checked before choosing it.</li>
      <li>The Fontshare licence text is shown on its page by a script, so a reader sees it only in a browser. Its section 01 and 02 wording is quoted above. The page shows "Version 2.0, 17 Aug 2026".</li>
      <li>Condensed and wide names look very different at the same width: Big Shoulders comes out much taller, Archivo and Syne much shorter. The home screen live pages keep the name the same width as today, so the stack of name and small line may sit a little differently on the screen.</li>
      <li>Do you want the section headings and the project titles to change together with the big headings, or only some of them? The samples here treat them all as one choice.</li>
    </ul>
  </section>
</div>`;

  return labPage({
    path: '/lab/fonts/',
    title: 'Font options | Preview only',
    styles: ['/lab-assets/font-options.css'],
    scripts: ['/lab-assets/font-options.js'],
    head,
    footer: false,
    content,
  });
}

function livePage(ctx, f, i) {
  const home = homePage(ctx);
  const cfg = { family: f.family.replace(/'/g, ''), weight: f.weight, stretch: f.stretch, ls: f.ls, transform: f.transform };
  const css = `.hero__title .hero__name{font-family:${f.family}, 'Helvetica Neue', Arial, sans-serif;font-weight:${f.weight};font-stretch:${f.stretch};letter-spacing:${f.ls};text-transform:${f.transform}}`;
  const head = [
    `<link rel="stylesheet" href="${esc(f.css)}">`,
    `<style>${css}</style>`,
    `<script type="application/json" id="fo-live">${JSON.stringify(cfg).replace(/</g, '\\u003c')}</script>`,
  ].join('\n');
  return labPage({
    ...home,
    path: `/lab/fonts/name-${i}/`,
    title: `Name option ${i} | Preview only`,
    description: 'Font option preview. Local only.',
    jsonld: [],
    styles: ['/lab-assets/font-options.css'],
    scripts: ['/lab-assets/font-options.js'],
    head,
    content: `${home.content}\n<a class="fo-back" href="/lab/fonts/#name-${i}">Preview only: name option ${i} (${esc(f.name)}). Back to the font options</a>`,
  });
}

export function fontOptionPages(ctx) {
  return [optionsPage(ctx), ...NAMES.map((f, i) => livePage(ctx, f, i + 1))];
}
