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
                           shared.js    labPage() and section(), used by every lab page
                           pages.js     the index at /lab/. Only the earlier ideas are left (D1 to D4, D6 to D8): everything
                                        from the revision round is answered. The pages that showed photo layouts and fonts
                                        were removed; they are in git history (last present in commit 1ab950f)
                           assets/      styles and scripts for the lab pages (served at /lab-assets/)
review/                  papers written for Ayden in the revision round: QUESTIONNAIRE.md (everything waiting on him), OPTIONS.md,
                         WORDING-INVENTORY.md, REVISIONS-LOG.md, SEO-TODO.md, SEO-COPY-DRAFTS.md, REPORT-SEO-AI.md,
                         REPORT-DOMAIN-EMAIL.md, and the research behind them in _agents/. Local only: kept out of git through
                         .git/info/exclude because the repository is public and these name competitors and unpublished plans
src/assets/css/main.css  the one stylesheet (design tokens at the top)
src/assets/fonts/        Inter Tight (labels), Marcellus (his name, with its license text) and Gambarino (headings).
                         Gambarino-Regular.woff2 is NOT in git: see tools/fonts.js and "Fonts" below
src/assets/js/*.js       browser scripts: main.js on every page, then home/work/film/photos/contact
public/                  copied as-is (favicon, og.jpg, apple-touch-icon)
tools/media.js           FFmpeg helper that makes loops, films, posters, photo sizes and before/after pairs
tools/fonts.js           downloads the heading font from Fontshare (run once on a fresh copy of the project; the publish
                         workflow runs it every time). build.js stops with a clear message if the font is missing
tools/*-sources.json     record of which original file each web file was cut from (local only: gitignored because it holds paths on Ayden's PC)
build.js / dev.js        build script / local preview server with auto-rebuild
.github/workflows/deploy.yml   publishes dist/ to GitHub Pages on every push to main (fetches the heading font first)
.pages.yml               form editor config for Pages CMS (app.pagescms.org)
docs/                    GUIDE.md (Ayden's launch and update guide) and NEEDS-FROM-AYDEN.md (open questions and things only he can supply; local only, gitignored like the sources files because it names unpublished client work; remove items as he answers them)
```

Published from `github.com/aydenjenson/aydenjenson.github.io` (public) to **`https://aydenjenson.com`**, which Ayden connected himself at Namecheap (checked 2026-11-17: four A records to GitHub, `www` CNAME to `aydenjenson.github.io`, domain verified at GitHub, certificate issued, Enforce HTTPS on; `http://`, `www.` and the old `aydenjenson.github.io` address all forward to `https://aydenjenson.com/`). There is no CNAME file and none is needed: the site is published by the Actions workflow, which keeps the custom domain in the repository settings. A small script in `layout.js` still marks the `github.io` address noindex; it is harmless now that the address forwards. Mail for the domain uses Namecheap's free forwarding (MX and SPF records): never change those rows when touching DNS. As of 2026-11-17 Google had only indexed the old Adobe Portfolio home page. On 2026-11-18 he chose to set up Search Console himself with a TXT record he adds at Namecheap, and to create a Google Business Profile himself (steps are in `review/REPORT-SEO-AI.md`); the domain had only its mail TXT record that day, so neither was done yet. He also chose free forwarding for a `contact@` address, which he adds himself at Namecheap; the site keeps showing the Gmail address until he says the new one works and asks for the swap.

Media is matched to projects **by file name**: a project with slug `seraphim-studios` automatically uses `media/loops/seraphim-studios.mp4`, `media/films/seraphim-studios.mp4` and `media/posters/seraphim-studios.jpg` if they exist. Nothing else needs to be edited.

## Design intent

Dark, cinematic, type-led. Large serif headings, small uppercase Inter Tight labels, one warm accent (`--accent`), film grain over everything. His name on the home screen has its own font and it is used nowhere else.

**Fonts** (his picks on 2026-11-18, from eight of each shown to him; he found the first serif, Instrument Serif, "slightly generic, the kind of look you see on AI-generated websites"):
- **Headings: Gambarino** (`--serif`). Its letters are about a quarter wider than Instrument Serif's, and every heading size had been tuned for that font, so he chose to keep the line lengths: every size set in the serif is multiplied by `--serif-k: 0.8` (and the few lengths given in ems of a serif size are divided by it). Headings break exactly where they did; the letters are about 15% shorter. Checked on 298 headings across 11 pages. A new serif means a new `--serif-k`, a new per-letter width in `src/pages/home.js` (`taglineEms`), and nothing else.
- **His name: Marcellus in capitals** (`--name`), 0.04em letter-spacing. Before that it was Inter Tight 600. `--name-size` is still the size the name would have in Inter Tight, the name is always 7.26 x that wide, and `--name-k` (0.9676) is what Marcellus is multiplied by to come out at that width.
- **Labels: Inter Tight**, unchanged.
- **Licenses decide how the files are kept.** Gambarino is under the ITF Free Font License (Fontshare): it may be hosted on his own site but not passed on through a public repository, and the file may not be changed in any way. This repository is public, so `Gambarino-Regular.woff2` is gitignored; `node tools/fonts.js` downloads it from Fontshare (he approved the download and chose this arrangement), the publish workflow runs that before every build, and a failed download stops the publish, leaving the live site as it was. Never commit that file, never subset or convert it. Marcellus is under the SIL Open Font License with the name reserved for unmodified copies, so it is the original `Marcellus-Regular.ttf` from google/fonts, unconverted, with `Marcellus-OFL.txt` beside it. No font is loaded from anyone else's server. Ayden's reference for the interaction is xanvierallison.com (his favorite, by far), then kaiblamey.com and danikbartolini.com. The signature pieces are:

- Home hero: his name over the full-screen reel, six project titles dropped at random spots in a 3 x 2 grid. It copies the mechanics of xanvierallison.com's home page on purpose (Ayden asked for "the exact same effect"), so keep these numbers unless he asks otherwise: hovering a title slides a **20%-wide, 20px-blurred, 105%-scaled strip** of that project in from the side of the screen the title is on; clicking opens it full screen, sharp, playing, and swaps the title for "See project"; clicking the name returns to the reel (which comes back from a 30px blur). Everything moves over **0.7s with cubic-bezier(.8, 0, .2, 1)**. A 600px soft blur spot trails the pointer over the name, and 75px blurred, darkened bands sit at the top and bottom. Classes and timing live in `main.css` section 6; `src/assets/js/home.js` only toggles `is-left / is-right / is-hovered / is-active`.
- Under the name sits one small line (`site.json` → `home.nameLine`, shown as "Cinematographer | Mankato, MN"; he asked for the bar instead of a slash) spread letter by letter to **exactly the width of the name**. `spread()` in `components.js` makes the letters and the bar, `.hero__role` sizes the box, and `home.js` measures the name (`--name-w`). Keep the text short enough to fit: about 30 characters. The name and the line are centered on the screen as a pair (`margin-top` on `.hero__title`). Sizes: he first wanted the line small and close to the name, then on 2026-11-17 asked for **both to be scaled up, with the name clearly the larger and the central element of the screen**, and on 2026-11-18 picked the largest of four sizes shown to him ("option3 but make line spacing between the two less"). So the name is `--name-size: clamp(40px, 4.75vw, 110px)`, the line follows it (`calc(var(--name-size) * 0.225)`, 11 to 17px), and the line's negative margin (`calc(-50px - var(--name-size) * 0.081)`, re-measured for Marcellus) leaves a gap of about an eighth of the name's size between the bottom of the name and the top of the small letters. He has asked for that gap to be smaller twice; do not open it up. The name button's width grows with the name (`max(...)` on `.hero__name`), otherwise the name breaks onto two lines on monitors around 2500px wide.
- Tagline under the reel: `site.json` → `home.statement`, **"Create content WORTH watching."** (his answers on 2026-11-18: capital C, WORTH in capitals, a period, centered, and "larger font to take up more horizontal space"). On a wide screen it is one centered line fitted to the full width of the text column: `main.css` sizes it from `--ems` (an estimate of the line's width that `src/pages/home.js` works out from the number of letters) and `fitLines()` in `assets/js/home.js` then fits it exactly, up to 240px. On a phone held upright (600px and narrower) it stacks as "Create content" over "WORTH watching.": the page prints it as two `.statement__line` halves and `fitLines()` sizes each so both lines are the same width (his choice over equal letter sizes). After it comes a thin gap and then Selected Work. He had the "Based in / Making" row and the About and Services links that sat there removed.
- On phones (900px and narrower) the six titles are scattered as well: one to a row, three above the name and three below, each at a random spot across its row. He asked for the phone layout of xanvierallison.com's home page. `home.js` picks each title's spot once per visit and keeps it in proportion on resize, so the titles do not jump when a phone hides its address bar.
- **No label or image that follows the pointer, anywhere.** Ayden said he does not want a pop-up near the cursor. Hover feedback stays inside the element (corner brackets on cards, the picture that opens inside a services row). The before/after line moves only while it is being dragged.
- **No emojis, anywhere** (he said so on 2026-11-17). That includes arrow characters: a typed arrow is not in the site's font files, and phones swap in a colored emoji. Link arrows are the drawn `ARROW` / `ARROW_UP` from `components.js`.
- "Color Grading Showcase" on the home page (after Selected Work; `home.gradeHeading`. He first typed "Colorgrading" and chose the two-word spelling on 2026-11-18. The text under it, `home.gradeText`, is his sentence "Color is what can make or break a video." followed by "Drag the line across the frame to compare the original footage with my finished look."): one frame with a line to drag, ungraded on the left and graded on the right, and a list that switches frames (`gradeSection()` in `components.js`, `initGrade()` in `main.js`, pictures in `media/grades/`). He picked it as D5. The section disappears by itself if the folder is empty.
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
node tools/fonts.js     fetch the heading font (needed once on a fresh copy of the project, before the first build)
```

On this Windows PC, Node, Git, GitHub CLI and FFmpeg were installed with winget. If a tool is "not found" in a fresh shell, refresh PATH first:
`$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`

## Common requests

**Add a video that is on YouTube.** Add an object to `content/projects.json` (copy a neighbor). Required: `slug`, `title`, `category` (`brand`, `creative` or `weddings`), `youtube` (full link is fine). Useful: `kind`, `client`, `role`, `camera`, `year`, `date` (YYYY-MM-DD), `duration` (seconds), `description`, and `aspect` (`4:3` or `9:16`) if it is not widescreen. Position in the file is position on the site. Then run `node tools/media.js youtube-posters` to fetch its poster and thumbnail. Two optional fields are for search only: `published` (the exact publish time YouTube gives, used in the hidden video data; without it the date alone is used, never a made-up time) and `seoDescription` (a shorter sentence for Google when his description plus the credit runs past 155 characters; the SCHEELS page has one, approved by him).

**How every project is written** (Ayden set this on 2026-11-17; keep new projects the same):
- Title: `Name - What it is` with a plain hyphen ("Chill & Connect - Summer Series"). Wedding titles are first names only ("Kylie + Arnold"), and no last names anywhere on a wedding page.
- The details list is the same on every page and in this order: Type (`kind`), Client, Role, Camera, Year, Length, then anything in `credits` (artist, narration, a note). `film.js` builds it; a row is left out only when the project has nothing for it. No Grade, Software, Location or "Produced by" rows.
- `kind` in Title Case ("Social Media Promotion", "Event Recap", "Skill Showcase").
- `role`: "Cinematographer, Editor, Colorist", capitalized. Add "Director" in front for commercials and anything with planned shots.
- `client`: every project except personal films. To link a name write `[Name](https://...)`; only `client` and `credits` values accept that.
- `camera`: "Fujifilm X-T3" for everything made up to November 2026. Ask about newer work.
- Descriptions say "promotional" or "promotion", never "promo" (a title may say Promo where Ayden wrote it that way). Always "Fujifilm", never "Fuji".
- Capitals: headings, labels and lists of roles or services are written in Title Case ("Cinematographer, Director, Editor, Colorist", "Brand Films, Commercials, Social Media", "Where I Work"). He finds lowercase lists like "Videographer, director, colorist" wrong. Full sentences stay as sentences.
- **Commas: every list of three or more gets a comma before the last item**, whether it is joined with "and", "or" or "&" ("brand films, commercials, and social media content", "a product, service, or event", "Brand Films, Commercials, & Creative"). He set this for the whole site on 2026-11-18: "if there is a list x y and z add commas like this everywhere x, y, and z", and then "the comma should still be added regardless of using the word and or the symbol &". It applies to visible text, picture descriptions and the descriptions Google shows. **A place name is not a list**: "Mankato, Minnesota and beyond" and "Based in Mankato, Minnesota and open to travel." take no comma after the state. I added one and he had it reverted ("the comma is for a location not a list").
- **Words to use with him:** he is American and did not know the term "full stop". Say "period". Use American spelling in anything he reads (centered, license, color).
- **His wording standards** (decided 2026-11-18, one question at a time; keep new text to these):
  - Town: "Mankato, MN" in titles, labels, credits and the line under his name; "Mankato, Minnesota" in full sentences.
  - He does not like "and beyond" ("I don't like how that sounds"). Reach is said with "Open to travel." as its own short sentence ("...located in Minnesota. Open to travel."). Do not bring "and beyond" back.
  - His title stays split: "Cinematographer" under his name; "Videographer & Cinematographer" in the footer and in the titles Google shows.
  - Roles are listed Director first: "Director, Cinematographer, Editor, Colorist" (About page and the project pages that credit him as director).
  - Service names are plural wherever they are shown, including the contact form buttons: Brand Films, Commercials, Social Media, Photography.
  - The footer line on every page is his exact text, `site.json` → `footer.line`: "Video Production and Photography in Southern Minnesota".
  - The line Google shows for the home page is his own sentence, trimmed with him to exactly 155 characters (`seo.description`): "I'm Ayden, a cinematographer and photographer based in Southern Minnesota focused on creating brand work, commercials, and social media content since 2017." He chose "Southern Minnesota", "cinematographer and photographer" and "brand work" there himself; do not "correct" them to Mankato, videographer or brand films.
  - Left as they are, by his choice: the headings "Selected Work" and "Stills", the link "All work", the page addresses `/work/` and `/photography/` (the menu alone says Video and Photo), "Promo" in the two titles he wrote that way, the different wordings of the links to the Contact page, and "businesses" (not "individuals and businesses") in the bio and the About description until the bio is rewritten.
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
The number at the start of the name sets the order across all categories. To remove a photo, delete its `-900`, `-1700` and `-2500` files. Add alt text in `content/photos.json`. Category folders and labels are listed in `site.json` → `photography.categories`: People, Events, and Branding (the folder is still called `brand`). `"tab": false` keeps a folder's photos under All without a filter button. `"hidden": true` leaves a folder off the site altogether: its photos are not shown and are not copied into `dist/`. The four `explore` photos (gas pump, diner, turkey in the woods, trail) are hidden that way: he chose to leave them out on 2026-11-18, and the files stay in `media/` so they can come back. Ayden wants this section small: only his best work. He looked at four other layouts for the Photography page and three for the home page photo block and kept both as they are (the grid with filter buttons, and the sliding strip headed "Stills" with no line of text). The Photography row on the Services page shows the first photo in his order; `"photo": "brand/01-dumbbells"` on that item in `site.json` picks a different one.

**Change text, contact details, services, service areas.** All in `content/site.json`. The one exception is the Privacy page: its wording lives in `src/pages/privacy.js` because it follows the settings (the analytics section appears only while `analytics.ga4` is set, and the contact form paragraph depends on `form.web3formsKey`). If a new outside service is added to the site, add it there too.

**Remove a project.** Delete it from `projects.json` (or set `"hidden": true`) and delete its files in `media/`.

**Publish.** Only when Ayden has seen the preview and explicitly said to publish that work. Work sits on a branch until then (on 2026-11-18 he approved the revisions as the base for the SEO fixes, not for publishing, and `seo-fixes` was branched from `revisions` that day: it holds the revision round plus the SEO fixes, and it is the branch to publish when he says so; neither branch is on GitHub). To publish: merge the approved branch into `main` and push `main`. GitHub Actions builds and publishes to aydenjenson.com in about a minute. Check the run with `gh run list --limit 3`, look at the live page, and report the result.

## Rules

- Never put a YouTube player behind text or under custom controls, and never autoplay it as a background. YouTube's terms forbid overlays on their player. YouTube films use the poster + play button on the project page, and that is all. Motion elsewhere comes from our own mp4 files.
- Video must stay on a host that supports HTTP range requests, or it will not play in Safari on iPhone. GitHub Pages does. Cloudflare Pages and Workers static assets do not (tested November 2026), so don't move the site there without moving video to separate storage.
- GitHub limits: 100 MB per file, about 1 GB for the published site, 100 GB bandwidth a month. `node build.js` prints the built size.
- Write copy that is true. Don't invent clients, awards, numbers or testimonials. The SCHEELS piece is spec work and must stay labeled that way.
- Things Ayden has ruled out: prices or "starting at" figures (he quotes each job), a booking button, testimonials (he has none yet), any mention of drone work (he is not Part 107 certified yet), cameras and software on the About page, a list of towns (the Services page says "Based in Mankato, Minnesota, and open to travel."), weddings as a service, a "How It Works" section and an FAQ on the Services page (he called them fluff; no FAQ structured data either), decorative numbers and photo counts, video lengths or platform names in the service descriptions ("no 15 to 60 seconds", "don't list reels, TikToks and shorts"), "photography" tacked onto the end of the Services title.
- For search data: no street address or phone number unless he gives one, no review or rating markup (there are no reviews on the site), and no FAQPage markup. New copy written for search goes to him as a draft first, in first person, plain, no em dashes, no hype. (An earlier rule against naming his employer, Wingert Land Services, was a mistake in his prompt. He lifted it on 2026-11-18: the company may be named, he plans to show work he made for it, and he plans to mention the job in his bio.)
- Services are Brand Films, Commercials, Social Media and Photography. "Videographer" stays in the page titles Google shows and beside his name in the footer because it is the word local clients search for, even though the line under his name says Cinematographer. (The home page description is his own sentence and says "cinematographer and photographer"; that was his choice.)
- Project `slug`s are public URLs (`/work/<slug>/`). Don't rename one after launch without adding a redirect in `site.json` → `redirects`.
- Respect `prefers-reduced-motion` and keep text readable over video (the hero shade does this).
- Templates escape text with `esc()`. Keep doing that for anything from the content files.
- His search and email choices (2026-11-18): the photo side is aimed at businesses only (branding, events, and people photos for businesses), so no copy offers portrait, senior, family or wedding sessions. Every crawler stays allowed, including the ones that collect AI training material, and there is no `llms.txt`: do not add blocks or that file unless he asks. The only YouTube channel the site links to or lists in its hidden data is `@aydenjenson`; do not add any other channel. The old Adobe Portfolio site stays as it is (it is part of a plan he uses).
- "Worked With" on the About page is his list (`about.clients` in `site.json`): he decides which names are on it, and the order does not matter to him. A name opens a project page only where he has confirmed that link (`about.clientLinks`: the name, then the project's slug). **Confirm every link with him before adding it** (his words on 2026-11-18: "confirm with me on all links before adding them so I can insure they are correct"). The strip holds still under the pointer so a name can be clicked. He plans to add Gigli projects and more names later.
- Search titles are 60 characters or fewer and search descriptions 155 or fewer (the limits in his audit). `src/pages/film.js` picks the fullest project title and description that fit. The main still on a project page that plays from YouTube is described as "Still from <title>". The business type in the hidden data stays `LocalBusiness`: schema.org marks the general `ProfessionalService` type as deprecated, and he chose to leave it. He said not now to a separate page for each service, and no to a YouTube player under the site's own player.

## Before saying a change is done

1. `node build.js` succeeds; read its notes. Then `node tools/check.js` reports no problems.
2. Look at the page in the preview (desktop width and phone width) and check the browser console. If the Browser pane is hidden, pages animate slowly and early screenshots look dark; wait a few seconds and screenshot again.
3. For media changes, play the loop or film in the preview.
4. If you pushed, confirm the GitHub Actions run succeeded.

## Not done yet / worth offering

- **The revision round and the SEO fixes are built and wait for his word to publish.** Branch `seo-fixes` (branched from `revisions` on 2026-11-18, after he approved the revisions) holds everything; nothing is on `main`, pushed or published. `review/QUESTIONNAIRE.md` holds 66 questions in 8 batches: all are answered and built except the files and the bio interview (28 to 32) and question 62 (a 2022 interview). `review/REVISIONS-LOG.md` says what was done, skipped and why. He likes answering a batch at a time as multiple choice in the chat, and he sometimes answers with free text that adds new instructions, so read every answer in full. New work goes on `seo-fixes`, or on a branch made from it, until he publishes.
- Waiting on files from him: the Fresh Air film and the Dylan + Riley (Evergreen, Colorado) wedding film, to replace the Dirt Bike and Golden Hour frames in the color section. This PC has only their YouTube thumbnails.
- `docs/NEEDS-FROM-AYDEN.md` is the older list of open questions and things only Ayden can supply. Read it before offering work, and update it when he answers something.
- 12 projects have no preview loop (the build lists them). They need Ayden's original exports, or 720p downloads of his own uploads from YouTube Studio. This PC and the Passport drive (E:) were searched on 2026-11-17 and do not have them; he believes they are in his Google Drive. Two of the six home titles (Seraphim Studios, Super Bowl LIX) are among them. He plans to send a batch of newer work and to cut a real showreel for the home screen, so the project list will change again.
- The design options page (`/lab/` in the preview) holds only the earlier ideas he has not answered (D1 to D4, D6 to D8). Everything from the revision round is answered and built in or closed; the list is at the top of `lab/pages.js`.
- The first publish with the new fonts is the first real run of the font download in the workflow. `node tools/fonts.js` was run on this PC and works; watch that run (`gh run list --limit 3`) and read the log if the "Fetch the heading font" step fails.
- The bio on the About page is a short placeholder written on 2026-11-17 at his request ("more professional", not "super AI", no over-sharing). He wants a proper one written from an interview; the questions are number 31 in `review/QUESTIONNAIRE.md`. Do not write it from guesses.
- Two before/after frames (SCHEELS turkey, rodeo) use a stand-in "before". They need the real ungraded frames from him.
- Search: he is setting up Google Search Console (the Namecheap way) and a Google Business Profile himself (steps in `review/REPORT-SEO-AI.md`). When he sends the profile link, ask before adding it to the hidden data (`sameAs`). When he says the `contact@` forwarder works, ask whether to show it on the site in place of the Gmail address. Google's speed test ran on 2026-11-18 through pagespeed.web.dev in the browser (the automatic route without a key still refused). On its simulated slow phone the live home page scored 78 for performance (largest element at 4.7 seconds, no layout shift) and the SCHEELS project page 76 (5.1 seconds; that page pulls in the whole 15 MB film, because a film hosted on the site starts playing when its page opens). Nothing was changed for speed: every fix changes how the site looks or behaves, or needs new media files. The numbers are in `review/SEO-TODO.md`, task 10.
- Contact form: needs a free Web3Forms key in `site.json` → `form.web3formsKey`. Until then it opens the visitor's email app.
- The About portrait is the 1200px copy from the old site. A higher-resolution original would be better.
- The Services wording is his choice as of 2026-11-18: the title "Full-Scale Video Production, Curated for You" (printed in phrases so it breaks after the comma, `.page-title__phrase`), his description, and the text he picked for Brand Films, Commercials and Social Media. The Photography row's text is still my draft.
- `.pages.yml` was written from the Pages CMS documentation and has not been tried against the live editor yet.
