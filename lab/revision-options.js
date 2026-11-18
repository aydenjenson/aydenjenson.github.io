// Options from Ayden's revision list of 2026-11-17 that are still waiting for
// his pick. Preview only. Every option carries the code he can answer with,
// in the form "A6 page: option 2". Nothing here is on the site until he picks.
//
//   revisionSections(ctx)   the blocks shown on /lab/
//
// Answered on 2026-11-18 and built into the site, so no longer here:
//   A1  name size: option 3 (the largest of four) with a smaller gap under the
//       name. The sizes are in main.css (.hero__title, .hero__role).
//   A2  tagline: "Create content WORTH watching.", centred, as wide as the page.
//   A4  the heading is "Color Grading Showcase"; the text under it is his first
//       sentence plus "Drag the line across the frame to compare the original
//       footage with my finished look."
//   A6  no line of text beside the photos on the home page; his description
//       ("A curated collection of favorites: people, events, and branding.")
//       is the line at the top of the Photography page. The LAYOUTS are still open.
//   A7  "Creating brand films, commercials, and social media content since 2017."
//   A8  Services title "Full-Scale Video Production, Curated for You", his
//       description with a comma before "and", Brand Films option 2,
//       Commercials option 1, Social Media option 2, the Photography row stays,
//       and "Where I Work" reads "Based in Mankato, Minnesota, and open to travel."
// All of that wording is in content/site.json.
import { esc, html } from '../src/lib/html.js';
import { ARROW } from '../src/pages/components.js';
import { section } from './shared.js';

const open = (href, label) => `<a class="link-arrow hover-blur" href="${href}">${esc(label)}<span class="link-arrow__icon" aria-hidden="true">${ARROW}</span></a>`;

export function revisionSections() {
  const a6 = section({
    id: 'a6',
    letter: 'A6',
    title: 'Photography: the layout',
    lead: 'How the photos are laid out: four working versions of the Photography page and three versions of the block on the home page, all built from your own photos and grouped as People, Events, and Branding. The wording is settled; this is only about the look.',
    body: html`
  <p class="lab-opts__links">
    ${open('/lab/photos/', 'Open the photo layout options')}
    ${open('/photography/', 'The Photography page as it is now')}
  </p>`,
  });

  const a11 = section({
    id: 'a11',
    letter: 'A11',
    title: 'Fonts',
    lead: 'Seven alternatives to the heading serif and seven for your name, each shown on dark and on light with the same words, with its license and how it would load. The name options can also be seen in place on the real home screen.',
    body: `<p class="lab-opts__links">${open('/lab/fonts/', 'Open the font options')}</p>`,
  });

  return [a6, a11].join('\n');
}
