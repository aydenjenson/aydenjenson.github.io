// Options from Ayden's revision list of 2026-11-17 (items tagged "give me
// options"). Preview only. Every option carries the code he can answer with,
// in the form "A8 title: option 3". Nothing here is on the site until he picks.
//
//   revisionSections(ctx)   the blocks shown on /lab/
//
// Answered and built into the site, so no longer here:
//   A1  name size: he picked option 3 (the largest of four) with a smaller gap
//       under the name. The sizes are in main.css (.hero__title, .hero__role).
import { esc, html } from '../src/lib/html.js';
import { ARROW } from '../src/pages/components.js';
import { section } from './shared.js';

/* A4. Second sentence of the Colorgrading Showcase description. The first sentence is his and stays. */
const A4_FIRST = 'Color is what can make or break a video.';
const A4_SECOND = [
  'Drag the line across the frame to compare each shot before and after my color grade.',
  'Drag the line across the frame to see the original footage next to the finished look.',
  'Drag the line across the frame to see what the shot looked like before I graded it.',
];
const A4_HIS = 'Drag the line across the frame to see examples of looks I have created';

/* A6. A line for the photography block on the home page (or none). */
const A6_HOME = [
  { text: '', note: 'No description. The heading and the photos only.' },
  { text: 'People, Events, Branding', note: 'A label, not a sentence.' },
  { text: 'Still photography of people, events and branding.', note: 'One plain sentence.' },
  { text: 'A small selection of favorites. See more on the Photography page.', note: 'Points to the page.' },
  { text: 'Favorites from my photography: people, events and branding.', note: 'About the work.' },
  { text: 'Photography is part of what I offer alongside video. See the collection.', note: 'Ties it to the video work.' },
];

/* A7. The one-line "short about me" on the home page. */
const A7_HIS = 'Creating brand films, commercials social media content since 2017';
const A7 = [
  'Creating brand films, commercials and social media content since 2017.',
  'I have been making brand films, commercials and social media content since 2017.',
  'Brand films, commercials and social media content in Mankato, Minnesota, since 2017.',
  'Videographer and cinematographer in Mankato, Minnesota, creating since 2017.',
  'Since 2017 I have planned, shot, edited and graded brand films, commercials and social media content.',
];

/* A8. Services page. */
const A8_TITLE_HIS = 'Full Scale Video Production Curated for YOU';
const A8_TITLES = [
  { text: 'Video Production, Curated for You', note: 'Drops "full scale", keeps your "curated for you" idea.' },
  { text: 'Video Production and Photography', note: 'Names both, video first.' },
  { text: 'Brand Films, Commercials, Social Media', note: 'Names the three video categories. Photography stays as its own row below.' },
  { text: 'Video Production in Mankato, MN', note: 'What the live site says now. The only one that keeps Mankato in the big heading, which helps local search.' },
  { text: 'Full-Scale Video Production, Curated for You', note: 'Your title with a hyphen in "Full-Scale", a comma, and "You" without capitals.' },
  { text: 'Video and Photography, Made for You', note: 'Covers both without "full scale".' },
];
const A8_DESC_NOW = 'Brand films, commercials and social media content for individuals and businesses located in Minnesota and beyond.';
const A8_DESC = [
  'I make brand films, commercials and social media content for individuals and businesses located in Minnesota and beyond.',
  'Video production, with photography available, for individuals and businesses located in Minnesota and beyond.',
  'Brand films, commercials, social media content and photography for individuals and businesses located in Minnesota and beyond.',
  'Planned, shot, edited and color graded by me: brand films, commercials and social media content for individuals and businesses located in Minnesota and beyond.',
];
const A8_CATEGORIES = [
  {
    key: 'brand', title: 'Brand Films', options: [
      ['A film that shows who you are and what you do.', 'A brand film is for the moment a customer wants to know who they are dealing with. It gives a business or an individual one piece to put on a website, a launch or an about page.'],
      ['Introduce your business, or yourself, in one film.', 'People trust what they can see and hear for themselves. A brand film shows your work and your people, so a new customer knows what to expect before they reach out.'],
      ['The main video for your business or personal brand.', 'A brand film is the one video that explains what you do and why it matters. Use it on your website, at a launch or anywhere a first impression counts.'],
    ],
  },
  {
    key: 'commercials', title: 'Commercials', options: [
      ['A video made to sell a product, service or event.', 'A commercial has one job: get the viewer to act. I build it around a single message, so a business can run it in ads or on its own channels.'],
      ['Paid advertising built around one clear message.', 'A commercial gives a business something to run in ads and put in front of new customers. I plan, shoot and edit it around what you want the viewer to do.'],
      ['Get your product, service or event in front of new customers.', 'A commercial is for a business that wants to be seen by people who do not know it yet. It keeps to one idea and one action for the viewer.'],
    ],
  },
  {
    key: 'social', title: 'Social Media', options: [
      ['Content made for short form platforms.', 'Social media content keeps a business or an individual visible and gives followers a reason to keep watching. I shoot and edit it to be engaging on short form platforms.'],
      ['Engaging content geared for short form platforms.', 'Regular video keeps your name in front of the people who follow you. I make it fit how people actually watch on their phones.'],
      ['Regular video that keeps your audience watching.', 'For a business or an individual, social media content is how people keep up with you between bigger projects. I plan and shoot it with the platform in mind.'],
    ],
  },
];

const code = (text, note = '') => `<p class="lab-opts__code"><b>${esc(text)}</b>${note ? `<span>${esc(note)}</span>` : ''}</p>`;
const open = (href, label) => `<a class="link-arrow hover-blur" href="${href}">${esc(label)}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a>`;

export function revisionSections(ctx) {
  const { site } = ctx;

  const a4 = section({
    id: 'a4',
    letter: 'A4',
    title: 'Colorgrading Showcase: the second sentence',
    lead: 'Your first sentence stays exactly as you wrote it. Pick a second sentence. Until you do, the section keeps the description that is on the live site.',
    body: html`
  <ol class="lab-opts">
    ${A4_SECOND.map((s, i) => html`
    <li>${code(`A4: option ${i + 1}`)}<p class="lab-opts__text lab-opts__text--lead">${esc(A4_FIRST)} ${esc(s)}</p></li>`)}
    <li>${code('A4: your draft', 'For comparison. It has no full stop at the end.')}<p class="lab-opts__text lab-opts__text--lead">${esc(A4_FIRST)} ${esc(A4_HIS)}</p></li>
  </ol>`,
  });

  const a6 = section({
    id: 'a6',
    letter: 'A6',
    title: 'Photography',
    lead: 'Two separate choices. First, how the photos are laid out: four working versions of the Photography page and three versions of the block on the home page. Second, whether the block on the home page has a line of text, and which.',
    body: html`
  <p class="lab-opts__links">
    ${open('/lab/photos/', 'Open the photo layout options')}
    ${open('/photography/', 'The Photography page as it is now')}
  </p>
  <h3 class="lab-sub">The line on the home page photo block</h3>
  <ol class="lab-opts">
    ${A6_HOME.map((o, i) => html`
    <li>${code(`A6 text: option ${i}`, o.note)}${o.text ? `<p class="lab-opts__text lab-opts__text--lead">${esc(o.text)}</p>` : '<p class="lab-opts__text lab-opts__text--none">(nothing)</p>'}</li>`)}
  </ol>
  <p class="lab-opts__aside">Now on the site: "${esc(site.home.photoText)}"</p>`,
  });

  const a7 = section({
    id: 'a7',
    letter: 'A7',
    title: 'The short line about you on the home page',
    lead: 'Your line is on the revisions branch exactly as you typed it. It reads "commercials social media content", which looks like a missing comma or a missing "and". These are other ways to say it. A fuller bio comes after the interview questions in the questionnaire.',
    body: html`
  <ol class="lab-opts">
    <li>${code('A7: your line', 'On the branch now, exactly as typed.')}<p class="lab-opts__text lab-opts__text--lead">${esc(A7_HIS)}</p></li>
    ${A7.map((s, i) => html`
    <li>${code(`A7: option ${i + 1}`, i === 0 ? 'Your line with "and" and a full stop.' : '')}<p class="lab-opts__text lab-opts__text--lead">${esc(s)}</p></li>`)}
  </ol>`,
  });

  const a8 = section({
    id: 'a8',
    letter: 'A8',
    title: 'Services page: title, description, the three categories',
    lead: 'Your title and your description ending are on the revisions branch as you wrote them. Below are alternatives for each, and two or three versions of the text for each video category. The category text on the site has not been changed yet.',
    body: html`
  <h3 class="lab-sub">Title</h3>
  <ol class="lab-opts">
    <li>${code('A8 title: yours', 'On the branch now.')}<p class="lab-opts__text lab-opts__text--title">${esc(A8_TITLE_HIS)}</p></li>
    ${A8_TITLES.map((o, i) => html`
    <li>${code(`A8 title: option ${i + 1}`, o.note)}<p class="lab-opts__text lab-opts__text--title">${esc(o.text)}</p></li>`)}
  </ol>

  <h3 class="lab-sub">Description under the title</h3>
  <ol class="lab-opts">
    <li>${code('A8 description: yours', 'On the branch now.')}<p class="lab-opts__text lab-opts__text--lead">${esc(A8_DESC_NOW)}</p></li>
    ${A8_DESC.map((s, i) => html`
    <li>${code(`A8 description: option ${i + 1}`)}<p class="lab-opts__text lab-opts__text--lead">${esc(s)}</p></li>`)}
  </ol>

  ${A8_CATEGORIES.map((c) => {
    const now = site.services.items.find((item) => item.title === c.title);
    return html`
  <h3 class="lab-sub">${esc(c.title)}</h3>
  <ol class="lab-opts lab-opts--cats">
    ${c.options.map(([summary, body], i) => html`
    <li>${code(`A8 ${c.key}: option ${i + 1}`)}<p class="lab-opts__text lab-opts__text--summary">${esc(summary)}</p><p class="lab-opts__text lab-opts__text--body">${esc(body)}</p></li>`)}
    ${now ? html`<li>${code(`A8 ${c.key}: as it is now`, 'On the site today.')}<p class="lab-opts__text lab-opts__text--summary">${esc(now.summary)}</p><p class="lab-opts__text lab-opts__text--body">${esc(now.body)}</p></li>` : ''}
  </ol>`;
  })}`,
  });

  const a11 = section({
    id: 'a11',
    letter: 'A11',
    title: 'Fonts',
    lead: 'Seven alternatives to the heading serif and seven for your name, each shown on dark and on light with the same words, with its licence and how it would load. The name options can also be seen in place on the real home screen.',
    body: `<p class="lab-opts__links">${open('/lab/fonts/', 'Open the font options')}</p>`,
  });

  return [a4, a6, a7, a8, a11].join('\n');
}
