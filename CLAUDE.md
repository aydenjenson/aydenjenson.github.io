# aydenjenson.com

Portfolio site for Ayden Jenson, a videographer and cinematographer in Mankato, MN.
The focus is business/brand video and creative cinematography, with a small curated photo section.

Ayden is not a developer. When he asks for a change: make it, check it, show it to him in the preview, and tell him in plain words what changed. Don't hand him commands to run unless he asks. `docs/GUIDE.md` is the guide written for him; keep it true when behavior changes.

**The site is live on his domain. Nothing is pushed, deployed or merged to `main` without his explicit approval** (his rule from the revision round of 2026-11-17; pushing `main` publishes within a minute). Work on a branch, commit there, leave it unpushed, and ask. An earlier go-ahead ("publish when finished") covered that batch only and does not carry over.

His other standing rules from that round, which apply to every request:

- **Do not assume or guess.** If something is unclear, contradicts something else, or needs a fact only he knows: skip it, put it in a questionnaire for him, and keep going with the rest. Never "pick something reasonable" for him.
- **Text he gives in quotes goes in exactly as typed**, capitals, spelling and punctuation included. If it looks like a slip, tell him; do not fix it silently.
- **A matter of taste gets options first, and nothing is applied until he picks.** He finds it hard to picture a design from a description, so show the choices in the design options page (`lab/`, below), each with a code he can answer with ("A8 title: option 3").
- **Do not modify, crop, re-encode or rename an existing image or video file.** New files made from his originals with `tools/media.js` are fine when he asks for them.
- **Do not invent facts.** Only what is already on the site or what he has said. No placeholder copy on a live page.
- Option previews and working papers stay out of the published site: the lab is preview-only, and `review/` is local-only (below).

## How it works

A static site with **no dependencies**. `node build.js` reads the content and media and writes plain HTML/CSS/JS to `dist/`. There is no `npm install`, no framework, no bundler. Keep it that way: do not add packages.

```
content/site.json        all site text and settings (contact, about, services, SEO, redirects)
content/projects.json    every video project, in display order
content/photos.json      optional alt text for photos
media/loops/             <slug>.mp4 silent preview loops (+ <slug>-hd.mp4 for the home hero)
media/films/             <slug>.mp4 full films hosted on the site
media/posters/           <slug>.jpg stills (+ thumbs/<slug>.jpg small copies)
media/photos/<category>/ photography page, one folder per category
media/about/             portrait-*.webp
media/grades/            before/after pairs for the color grading slider: <nn>-<slug>[-label]-after.webp + -before.webp
                         (a "-before-sim.webp" is a stand-in made from the finished frame, not real ungraded footage)
src/pages/*.js           HTML templates (one file per page type, plus layout.js and components.js)
src/lib/*.js             build helpers (media scan, SEO structured data, image/mp4 readers, social logo outlines in icons.js)
lab/                     design options for Ayden to look at. Preview only: built by `node build.js --lab`, which dev.js always
                         passes, so http://localhost:4321/lab/ exists in the preview and never on the published site or in the
                         sitemap. Each option has a code (A8 title: option 3, D4 ...). When he picks one, build it into src/
                         properly and take it out of the lab. The top of lab/pages.js lists what he has already picked.
                           shared.js             labPage() and section(), used by every lab page
                           pages.js              the index at /lab/ and the earlier ideas (D1 to D4, D6 to D8)
                           revision-options.js   wording and size options from the 2026-11-17 revision round (A1, A4, A6, A7, A8)
                           photo-options.js      /lab/photos/: four Photography page layouts and three home page blocks (A6)
                           font-options.js       /lab/fonts/: heading serifs and name fonts with licence notes (A11). Only these
                                                 preview pages load fonts from Google Fonts and Fontshare; the site hosts its own
                           assets/               styles and scripts for the lab pages (served at /lab-assets/)
review/                  papers written for Ayden in the revision round: QUESTIONNAIRE.md (everything waiting on him), OPTIONS.md,
                         WORDING-INVENTORY.md, REVISIONS-LOG.md, SEO-TODO.md, SEO-COPY-DRAFTS.md, REPORT-SEO-AI.md,
                         REPORT-DOMAIN-EMAIL.md, and the research behind them in _agents/. Local only: kept out of git through
                         .git/info/exclude because the repository is public and these name competitors and unpublished plans
src/assets/css/main.css  the one stylesheet (design tokens at the top)
src/assets/js/*.js       browser scripts: main.js on every page, then home/work/film/photos/contact
public/                  copied as-is (favicon, og.jpg, apple-touch-icon)
tools/media.js           FFmpeg helper that makes loops, films, posters, photo sizes and before/after pairs
tools/*-sources.json     record of which original file each web file was cut from (local only: gitignored because it holds paths on Ayden's PC)
build.js / dev.js        build script / local preview server with auto-rebuild
.github/workflows/deploy.yml   publishes dist/ to GitHub Pages on every push to main
.pages.yml               form editor config for Pages CMS (app.pagescms.org)
docs/                    GUIDE.md (Ayden's launch and update guide) and NEEDS-FROM-AYDEN.md (open questions and things only he can supply; local only, gitignored like the sources files because it names unpublished client work; remove items as he answers them)
```

Published from `github.com/aydenjenson/aydenjenson.github.io` (public) to **`https://aydenjenson.com`**, which Ayden connected himself at Namecheap (checked 2026-11-17: four A records to GitHub, `www` CNAME to `aydenjenson.github.io`, domain verified at GitHub, certificate issued, Enforce HTTPS on; `http://`, `www.` and the old `aydenjenson.github.io` address all forward to `https://aydenjenson.com/`). There is no CNAME file and none is needed: the site is published by the Actions workflow, which keeps the custom domain in the repository settings. A small script in `layout.js` still marks the `github.io` address noindex; it is harmless now that the address forwards. Mail for the domain uses Namecheap's free forwarding (MX and SPF records): never change those rows when touching DNS. As of 2026-11-17 Google had only indexed the old Adobe Portfolio home page; he has not set up Search Console or a Google Business Profile yet (steps are in `review/REPORT-SEO-AI.md`).

Media is matched to projects **by file name**: a project with slug `seraphim-studios` automatically uses `media/loops/seraphim-studios.mp4`, `media/films/seraphim-studios.mp4` and `media/posters/seraphim-studios.jpg` if they exist. Nothing else needs to be edited.

## Design intent

Dark, cinematic, type-led. Large Instrument Serif headings, small uppercase Inter Tight labels, one warm accent (`--accent`), film grain over everything. His name on the home screen is the one exception to the serif: Inter Tight 600 in capitals (his pick, A7, on 2026-11-17). He likes both fonts and said the name font is not needed anywhere else. Ayden's reference for the interaction is xanvierallison.com (his favorite, by far), then kaiblamey.com and danikbartolini.com. The signature pieces are:

- Home hero: his name over the full-screen reel, six project titles dropped at random spots in a 3 x 2 grid. It copies the mechanics of xanvierallison.com's home page on purpose (Ayden asked for "the exact same effect"), so keep these numbers unless he asks otherwise: hovering a title slides a **20%-wide, 20px-blurred, 105%-scaled strip** of that project in from the side of the screen the title is on; clicking opens it full screen, sharp, playing, and swaps the title for "See project"; clicking the name returns to the reel (which comes back from a 30px blur). Everything moves over **0.7s with cubic-bezier(.8, 0, .2, 1)**. A 600px soft blur spot trails the pointer over the name, and 75px blurred, darkened bands sit at the top and bottom. Classes and timing live in `main.css` section 6; `src/assets/js/home.js` only toggles `is-left / is-right / is-hovered / is-active`.
- Under the name sits one small line (`site.json` → `home.nameLine`, shown as "Cinematographer | Mankato, MN"; he asked for the bar instead of a slash) spread letter by letter to **exactly the width of the name**. `spread()` in `components.js` makes the letters and the bar, `.hero__role` sizes the box, and `home.js` measures the name (`--name-w`). Keep the text short enough to fit: about 30 characters. The name and the line are centred on the screen as a pair (`margin-top` on `.hero__title`). Sizes: he first wanted the line small and close to the name, then on 2026-11-17 asked for **both to be scaled up, with the name clearly the larger and the central element of the screen**. The name is `--name-size: clamp(34px, 3.95vw, 92px)` and the line follows it (`calc(var(--name-size) * 0.235)`, 10.5 to 15px, `-46px` margin). That is option 2 of four shown to him in the lab (A1); he has not confirmed the size yet.
- Tagline under the reel: `site.json` → `home.statement`, **"create content WORTH watching"** exactly as he typed it (lowercase c, WORTH in capitals). It is large (`.statement__text`), and on phones it stacks as "create content" over "WORTH watching": `home.js` prints it as two `.statement__line` halves and `fitLines()` sizes each so both lines are the same width. After it comes a thin gap and then Selected Work. He had the "Based in / Making" row and the About and Services links that sat there removed.
- On phones (900px and narrower) the six titles are scattered as well: one to a row, three above the name and three below, each at a random spot across its row. He asked for the phone layout of xanvierallison.com's home page. `home.js` picks each title's spot once per visit and keeps it in proportion on resize, so the titles do not jump when a phone hides its address bar.
- **No label or image that follows the pointer, anywhere.** Ayden said he does not want a pop-up near the cursor. Hover feedback stays inside the element (corner brackets on cards, the picture that opens inside a services row). The before/after line moves only while it is being dragged.
- **No emojis, anywhere** (he said so on 2026-11-17). That includes arrow characters: a typed arrow is not in the site's font files, and phones swap in a coloured emoji. Link arrows are the drawn `ARROW` / `ARROW_UP` from `components.js`.
- "Colorgrading Showcase" on the home page (after Selected Work; the heading is his exact text, `home.gradeHeading`, and he has been asked whether he wants "Color Grading" as two words): one frame with a line to drag, ungraded on the left and graded on the right, and a list that switches frames (`gradeSection()` in `components.js`, `initGrade()` in `main.js`, pictures in `media/grades/`). He picked it as D5. The section disappears by itself if the folder is empty.
- **No numbers as decoration.** He had every "01 / Work", "06 Western Fest" style number and every photo count removed on 2026-11-17. The only numbers left do a job: the position counter in the full-screen photo viewer, the reel length on "Play reel", years and lengths on project pages, and the film player's time.
- The menu says **Video** and **Photo** (his labels). The page addresses are still `/work/` and `/photography/`, and headings such as "Selected Work" are unchanged until he decides.
- Social links are white logos (`socialLinks()` in `components.js`, outlines in `src/lib/icons.js`), not words: bottom right of the home screen, the footer, the Contact page and the phone menu.
- There is no clock. He had it removed.
- Video page (`/work/`): one project at a time (his pick, C5; the idea is from kaiblamey.com). One film fills the screen, the list of titles moves through the middle and the footage behind changes, with the details at the side and category buttons at the bottom (`src/pages/work.js`, `src/assets/js/work.js`). He found scrolling it "harder than it needs to be", so the list is a real scroll box one screen tall: on a computer, resting the pointer below the middle scrolls it on and above the middle scrolls it back (dead zone 0.18 of the height, up to 420px a second), the wheel works anywhere on the section, and the middle title, the one whose footage is playing, is thickened with a text stroke (the serif has one weight, and a faked bold would re-wrap long titles). On a phone the list is dragged and scrolls freely. Upright films are shown whole over a blurred copy of themselves on wide screens. Without JavaScript it is a plain list of links.
- Spacing comes from three sizes at the top of `main.css`: `--gap-section` (after a whole section), `--gap-row` (around one row in a ruled list) and `--gap-block` (between a heading and what it introduces). He asked for uniform spacing with no wasted space; use these and do not invent new gaps.
- Project page: full-screen player with text controls that fade while the film plays (`film.js`).
- A soft blur that runs through the letters of a link on hover (`.hover-blur` + `chars()`: 3px, 0.6s, 40ms per letter), reveals on scroll (`data-reveal`), and gentle parallax (`data-parallax`).

New sections should reuse those pieces rather than add new effects.

## Commands

```
node build.js           build into dist/ and print notes (missing loops, missing form key, ...)
node build.js --check   validate content only
node build.js --lab     the same build plus the design options pages (what dev.js runs; never used for publishing)
node tools/check.js     after a build: every internal link resolves, SEO tags present, structured data valid
node dev.js             preview at http://localhost:4321 with auto-rebuild (.claude/launch.json runs this as "site"; it uses the full path to dev.js because the app may start it from another folder)
node tools/media.js     list the media commands
```

On this Windows PC, Node, Git, GitHub CLI and FFmpeg were installed with winget. If a tool is "not found" in a fresh shell, refresh PATH first:
`$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`

## Common requests

**Add a video that is on YouTube.** Add an object to `content/projects.json` (copy a neighbor). Required: `slug`, `title`, `category` (`brand`, `creative` or `weddings`), `youtube` (full link is fine). Useful: `kind`, `client`, `role`, `camera`, `year`, `date` (YYYY-MM-DD), `duration` (seconds), `description`, and `aspect` (`4:3` or `9:16`) if it is not widescreen. Position in the file is position on the site. Then run `node tools/media.js youtube-posters` to fetch its poster and thumbnail.

**How every project is written** (Ayden set this on 2026-11-17; keep new projects the same):
- Title: `Name - What it is` with a plain hyphen ("Chill & Connect - Summer Series"). Wedding titles are first names only ("Kylie + Arnold"), and no last names anywhere on a wedding page.
- The details list is the same on every page and in this order: Type (`kind`), Client, Role, Camera, Year, Length, then anything in `credits` (artist, narration, a note). `film.js` builds it; a row is left out only when the project has nothing for it. No Grade, Software, Location or "Produced by" rows.
- `kind` in Title Case ("Social Media Promotion", "Event Recap", "Skill Showcase").
- `role`: "Cinematographer, Editor, Colorist", capitalized. Add "Director" in front for commercials and anything with planned shots.
- `client`: every project except personal films. To link a name write `[Name](https://...)`; only `client` and `credits` values accept that.
- `camera`: "Fujifilm X-T3" for everything made up to November 2026. Ask about newer work.
- Descriptions say "promotional" or "promotion", never "promo" (a title may say Promo where Ayden wrote it that way). Always "Fujifilm", never "Fuji".
- Capitals: headings, labels and lists of roles or services are written in Title Case ("Cinematographer, Director, Editor, Colorist", "Brand Films, Commercials, Social Media", "Where I Work"). He finds lowercase lists like "Videographer, director, colorist" wrong. Full sentences stay as sentences.
- Wedding pages have no "Create something like this" link: he no longer takes weddings (`"inquiries": false` on the category in `site.json`). The link on every other project reads "Create something like this".

**Add a preview loop** (what plays on hover and in the home hero). Needs the original video file:
`node tools/media.js loop "<file>" <slug> --start 3 --dur 8` (add `--hd` for featured projects, `--at 5` to pick the poster frame, `--crop w:h:x:y` if the clip has black bars baked in). Add the job to `tools/media-sources.json` so it can be re-run.

**Host the full film on the site** (seamless player instead of the YouTube button):
`node tools/media.js film "<file>" <slug>`. Keep each film under about 30 MB (`--max-mb`). Good for pieces under two minutes. Leave long films on YouTube.

**Add or replace a before/after frame** (the color grading slider on the home page). He sends the same frame twice, with his grade off and on:
`node tools/media.js grade "<graded still or film>" <nn>-<project-slug> --before "<ungraded still>"` (add `--at 5.3` and `--before-at 5.3` when the inputs are videos, `--crop w:h:x:y` for baked-in bars). The number sets the order. Words after the slug become the name in the list (`05-the-beauty-of-color-grading-dirt-bike` shows as "Dirt Bike"); without them the project title is used. `--fake` instead of `--before` makes a stand-in "before" from the finished frame (`-before-sim.webp`); he asked for that on the SCHEELS and rodeo frames to get started, and the build prints a note until they are replaced with real ungraded frames. Four pairs are real, cut from his film "The Beauty of Color Grading" (three clips stacked per screen, each shown ungraded and then graded).

**Change the six titles over the home reel.** Edit `site.json` → `home.heroProjects`: a list of project slugs, top row first, left to right. If the list is empty the first six featured projects are used. Each one should have a loop, ideally `--hd`; without one the title opens that project's still with a slow drift, and the build prints a note. `tools/media.js loop` also writes `media/loops/<slug>.jpg` and `<slug>-sm.jpg` (the loop's first frame), which the hero shows before the video plays. Only landscape footage works here: the layer fills the screen, so a vertical clip would be cropped to a thin band.

**Feature a project in "Selected work".** Set `"featured": true`. The first six featured projects are the cards further down the home page.

**Change the home hero background.** It is the loop of the project named in `site.json` → `home.reelProject` (`showreel`). Replace `media/loops/showreel-hd.mp4` and `media/loops/showreel.mp4`. The current one is a stand-in montage cut from other projects; Ayden's real reel is on YouTube only.

**Add or remove photos.** Web sizes are made with
`node tools/media.js photo "<file or folder>" <category> --name 27-short-name`.
The number at the start of the name sets the order across all categories. To remove a photo, delete its `-900`, `-1700` and `-2500` files. Add alt text in `content/photos.json`. Category folders and labels are listed in `site.json` → `photography.categories`: People, Events and Branding (the folder is still called `brand`). `"tab": false` keeps a folder's photos under All without a filter button; the four `explore` photos are parked that way until he decides on them. Ayden wants this section small: only his best work.

**Change text, contact details, services, service areas.** All in `content/site.json`. The one exception is the Privacy page: its wording lives in `src/pages/privacy.js` because it follows the settings (the analytics section appears only while `analytics.ga4` is set, and the contact form paragraph depends on `form.web3formsKey`). If a new outside service is added to the site, add it there too.

**Remove a project.** Delete it from `projects.json` (or set `"hidden": true`) and delete its files in `media/`.

**Publish.** Only when Ayden has seen the preview and explicitly said to publish that work. Work sits on a branch until then (the 2026-11-17 revision round is on `revisions`; his SEO fixes go on `seo-fixes`, branched from it once he approves the revisions). To publish: merge the approved branch into `main` and push `main`. GitHub Actions builds and publishes to aydenjenson.com in about a minute. Check the run with `gh run list --limit 3`, look at the live page, and report the result.

## Rules

- Never put a YouTube player behind text or under custom controls, and never autoplay it as a background. YouTube's terms forbid overlays on their player. YouTube films use the poster + play button on the project page, and that is all. Motion elsewhere comes from our own mp4 files.
- Video must stay on a host that supports HTTP range requests, or it will not play in Safari on iPhone. GitHub Pages does. Cloudflare Pages and Workers static assets do not (tested November 2026), so don't move the site there without moving video to separate storage.
- GitHub limits: 100 MB per file, about 1 GB for the published site, 100 GB bandwidth a month. `node build.js` prints the built size.
- Write copy that is true. Don't invent clients, awards, numbers or testimonials. The SCHEELS piece is spec work and must stay labeled that way.
- Things Ayden has ruled out: prices or "starting at" figures (he quotes each job), a booking button, testimonials (he has none yet), any mention of drone work (he is not Part 107 certified yet), cameras and software on the About page, a list of towns (the site says "Mankato, MN and beyond. Open to travel."), weddings as a service, a "How It Works" section and an FAQ on the Services page (he called them fluff; no FAQ structured data either), decorative numbers and photo counts, video lengths or platform names in the service descriptions ("no 15 to 60 seconds", "don't list reels, TikToks and shorts"), "photography" tacked onto the end of the Services title.
- For search data: no street address or phone number unless he gives one, no review or rating markup (there are no reviews on the site), no FAQPage markup, and nothing about his employer or work done for it. New copy written for search goes to him as a draft first, in first person, plain, no em dashes, no hype.
- Services are Brand Films, Commercials, Social Media and Photography. "Videographer" stays in page titles, descriptions and the footer because it is the word local clients search for, even though the line under his name says Cinematographer.
- Project `slug`s are public URLs (`/work/<slug>/`). Don't rename one after launch without adding a redirect in `site.json` → `redirects`.
- Respect `prefers-reduced-motion` and keep text readable over video (the hero shade does this).
- Templates escape text with `esc()`. Keep doing that for anything from the content files.

## Before saying a change is done

1. `node build.js` succeeds; read its notes. Then `node tools/check.js` reports no problems.
2. Look at the page in the preview (desktop width and phone width) and check the browser console. If the Browser pane is hidden, pages animate slowly and early screenshots look dark; wait a few seconds and screenshot again.
3. For media changes, play the loop or film in the preview.
4. If you pushed, confirm the GitHub Actions run succeeded.

## Not done yet / worth offering

- **The revision round of 2026-11-17 is waiting on him.** Branch `revisions` holds what could be done without a decision (larger name and tagline, his exact wording, numbers and extra sections removed, Video and Photo labels, the self-scrolling video list, the spacing sweep, the option previews). Nothing from it is on `main` or published. `review/QUESTIONNAIRE.md` lists every decision he still has to make (66 questions in 8 batches) and `review/REVISIONS-LOG.md` what was done, skipped and why. When he answers: apply his picks on `revisions`, take the chosen options out of the lab, and only then start `seo-fixes` (the prepared list is `review/SEO-TODO.md`).
- Waiting on files from him: the Fresh Air film and the Dylan + Riley (Evergreen, Colorado) wedding film, to replace the Dirt Bike and Golden Hour frames in the color section. This PC has only their YouTube thumbnails.
- `docs/NEEDS-FROM-AYDEN.md` is the older list of open questions and things only Ayden can supply. Read it before offering work, and update it when he answers something.
- 12 projects have no preview loop (the build lists them). They need Ayden's original exports, or 720p downloads of his own uploads from YouTube Studio. This PC and the Passport drive (E:) were searched on 2026-11-17 and do not have them; he believes they are in his Google Drive. Two of the six home titles (Seraphim Studios, Super Bowl LIX) are among them. He plans to send a batch of newer work and to cut a real showreel for the home screen, so the project list will change again.
- The design options page (`/lab/` in the preview) holds the open choices from the revision round (A1 name size, A4, A6 photo layouts and text, A7, A8, A11 fonts) and the earlier ideas he has not answered (D1 to D4, D6 to D8). His earlier picks (A7 + B1 for the name font, C5, D5, E1) are built in. Note the code "A7" now means the short about line; the old A7 was the name font.
- The bio on the About page is a short placeholder written on 2026-11-17 at his request ("more professional", not "super AI", no over-sharing). He wants a proper one written from an interview; the questions are number 31 in `review/QUESTIONNAIRE.md`. Do not write it from guesses.
- Two before/after frames (SCHEELS turkey, rodeo) use a stand-in "before". They need the real ungraded frames from him.
- Search: he needs to set up Google Search Console and a Google Business Profile himself (steps in `review/REPORT-SEO-AI.md`). Google's speed test could not be run on 2026-11-17 (its daily limit for automatic requests was used up); try again or have him run pagespeed.web.dev.
- Contact form: needs a free Web3Forms key in `site.json` → `form.web3formsKey`. Until then it opens the visitor's email app.
- The About portrait is the 1200px copy from the old site. A higher-resolution original would be better.
- `content/site.json` service descriptions and the client list were drafted for Ayden and need his review (new options for the three video categories are in the lab as A8). He wants to add to and remove from the "Worked with" list himself.
- `.pages.yml` was written from the Pages CMS documentation and has not been tried against the live editor yet.
