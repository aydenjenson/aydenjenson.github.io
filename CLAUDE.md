# aydenjenson.com

Portfolio site for Ayden Jenson, a videographer and cinematographer in Mankato, MN.
The focus is business/brand video and creative cinematography, with a small curated photo section.

Ayden is not a developer. When he asks for a change: make it, check it, publish it, and tell him in plain words what changed. Don't hand him commands to run unless he asks. `docs/GUIDE.md` is the guide written for him; keep it true when behavior changes.

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
src/pages/*.js           HTML templates (one file per page type, plus layout.js and components.js)
src/lib/*.js             build helpers (media scan, SEO structured data, image/mp4 readers)
src/assets/css/main.css  the one stylesheet (design tokens at the top)
src/assets/js/*.js       browser scripts: main.js on every page, then home/work/film/photos/contact
public/                  copied as-is (favicon, og.jpg, apple-touch-icon)
tools/media.js           FFmpeg helper that makes loops, films, posters and photo sizes
tools/*-sources.json     record of which original file each web file was cut from (local only: gitignored because it holds paths on Ayden's PC)
build.js / dev.js        build script / local preview server with auto-rebuild
.github/workflows/deploy.yml   publishes dist/ to GitHub Pages on every push to main
.pages.yml               form editor config for Pages CMS (app.pagescms.org)
```

Media is matched to projects **by file name**: a project with slug `seraphim-studios` automatically uses `media/loops/seraphim-studios.mp4`, `media/films/seraphim-studios.mp4` and `media/posters/seraphim-studios.jpg` if they exist. Nothing else needs to be edited.

## Design intent

Dark, cinematic, type-led. Large Instrument Serif headings, small uppercase Inter Tight labels, one warm accent (`--accent`), film grain over everything. Ayden's reference for the interaction is xanvierallison.com (his favorite, by far), then kaiblamey.com and danikbartolini.com. The signature pieces are:

- Home hero: his name over the full-screen reel, six project titles dropped at random spots in a 3 x 2 grid. It copies the mechanics of xanvierallison.com's home page on purpose (Ayden asked for "the exact same effect"), so keep these numbers unless he asks otherwise: hovering a title slides a **20%-wide, 20px-blurred, 105%-scaled strip** of that project in from the side of the screen the title is on; clicking opens it full screen, sharp, playing, and swaps the title for "See project"; clicking the name returns to the reel (which comes back from a 30px blur). Everything moves over **0.7s with cubic-bezier(.8, 0, .2, 1)**. A 600px soft blur spot trails the pointer over the name, and 75px blurred, darkened bands sit at the top and bottom. Classes and timing live in `main.css` section 6; `src/assets/js/home.js` only toggles `is-left / is-right / is-hovered / is-active`.
- **No label or image that follows the pointer, anywhere.** Ayden said he does not want a pop-up near the cursor. Hover feedback stays inside the element (corner brackets on cards, the picture that opens inside a services row).
- Work "wall": three endless columns drifting in opposite directions (`work.js`), with an Index list as the alternative and the phone layout.
- Project page: full-screen player with text controls that fade while the film plays (`film.js`).
- A soft blur that runs through the letters of a link on hover (`.hover-blur` + `chars()`: 3px, 0.6s, 40ms per letter), reveals on scroll (`data-reveal`), and gentle parallax (`data-parallax`).

New sections should reuse those pieces rather than add new effects.

## Commands

```
node build.js           build into dist/ and print notes (missing loops, missing form key, ...)
node build.js --check   validate content only
node tools/check.js     after a build: every internal link resolves, SEO tags present, structured data valid
node dev.js             preview at http://localhost:4321 with auto-rebuild (.claude/launch.json runs this as "site"; it uses the full path to dev.js because the app may start it from another folder)
node tools/media.js     list the media commands
```

On this Windows PC, Node, Git, GitHub CLI and FFmpeg were installed with winget. If a tool is "not found" in a fresh shell, refresh PATH first:
`$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`

## Common requests

**Add a video that is on YouTube.** Add an object to `content/projects.json` (copy a neighbor). Required: `slug`, `title`, `category` (`brand`, `creative` or `weddings-events`), `youtube` (full link is fine). Useful: `kind`, `year`, `date` (YYYY-MM-DD), `duration` (seconds), `description`, `credits`, and `aspect` (`4:3` or `9:16`) if it is not widescreen. Position in the file is position on the site. Then run `node tools/media.js youtube-posters` to fetch its poster and thumbnail.

**Add a preview loop** (what plays on hover and in the home hero). Needs the original video file:
`node tools/media.js loop "<file>" <slug> --start 3 --dur 8` (add `--hd` for featured projects, `--at 5` to pick the poster frame, `--crop w:h:x:y` if the clip has black bars baked in). Add the job to `tools/media-sources.json` so it can be re-run.

**Host the full film on the site** (seamless player instead of the YouTube button):
`node tools/media.js film "<file>" <slug>`. Keep each film under about 30 MB (`--max-mb`). Good for pieces under two minutes. Leave long films on YouTube.

**Feature a project on the home page.** Set `"featured": true`. The first 6 featured projects are the scattered hero titles and the "Selected work" cards. Featured projects should have a loop, ideally `--hd`; without one the hero shows that project's poster as a still. `tools/media.js loop` also writes `media/loops/<slug>.jpg` and `<slug>-sm.jpg` (the loop's first frame), which the hero shows before the video plays.

**Change the home hero background.** It is the loop of the project named in `site.json` → `home.reelProject` (`showreel`). Replace `media/loops/showreel-hd.mp4` and `media/loops/showreel.mp4`. The current one is a stand-in montage cut from other projects; Ayden's real reel is on YouTube only.

**Add or remove photos.** Web sizes are made with
`node tools/media.js photo "<file or folder>" <category> --name 27-short-name`.
The number at the start of the name sets the order across all categories. To remove a photo, delete its `-900`, `-1700` and `-2500` files. Add alt text in `content/photos.json`. Category folders and labels are listed in `site.json` → `photography.categories`. Ayden wants this section small: only his best work.

**Change text, contact details, services, FAQ, service areas.** All in `content/site.json`.

**Remove a project.** Delete it from `projects.json` (or set `"hidden": true`) and delete its files in `media/`.

**Publish.** Commit and push to `main`. GitHub Actions builds and publishes in about two minutes. Check the run with `gh run list --limit 3` and report the result.

## Rules

- Never put a YouTube player behind text or under custom controls, and never autoplay it as a background. YouTube's terms forbid overlays on their player. YouTube films use the poster + play button on the project page, and that is all. Motion elsewhere comes from our own mp4 files.
- Video must stay on a host that supports HTTP range requests, or it will not play in Safari on iPhone. GitHub Pages does. Cloudflare Pages and Workers static assets do not (tested November 2026), so don't move the site there without moving video to separate storage.
- GitHub limits: 100 MB per file, about 1 GB for the published site, 100 GB bandwidth a month. `node build.js` prints the built size.
- Write copy that is true. Don't invent clients, awards, numbers or testimonials. The SCHEELS piece is spec work and must stay labeled that way.
- Project `slug`s are public URLs (`/work/<slug>/`). Don't rename one after launch without adding a redirect in `site.json` → `redirects`.
- Respect `prefers-reduced-motion` and keep text readable over video (the hero shade does this).
- Templates escape text with `esc()`. Keep doing that for anything from the content files.

## Before saying a change is done

1. `node build.js` succeeds; read its notes. Then `node tools/check.js` reports no problems.
2. Look at the page in the preview (desktop width and phone width) and check the browser console. If the Browser pane is hidden, pages animate slowly and early screenshots look dark; wait a few seconds and screenshot again.
3. For media changes, play the loop or film in the preview.
4. If you pushed, confirm the GitHub Actions run succeeded.

## Not done yet / worth offering

- 14 projects have no preview loop (the build lists them). They need Ayden's original exports, or 720p downloads of his own uploads from YouTube Studio.
- Contact form: needs a free Web3Forms key in `site.json` → `form.web3formsKey`. Until then it opens the visitor's email app.
- The About portrait is the 1200px copy from the old site. A higher-resolution original would be better.
- `content/site.json` service descriptions, FAQ answers, process steps and the client list were drafted for Ayden and need his review.
- `.pages.yml` was written from the Pages CMS documentation and has not been tried against the live editor yet.
