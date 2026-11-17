#!/usr/bin/env node
// Builds the whole website into dist/. No dependencies: just `node build.js`.
//
//   content/*.json   what the site says (text, projects, settings)
//   media/           what it shows (loops, films, posters, photos)
//   src/pages/       the HTML templates
//   src/assets/      CSS, JavaScript, fonts
//   public/          files copied as-is (favicon, robots.txt, ...)
//
// `node build.js --check` validates the content without writing anything.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { scanMedia } from './src/lib/media.js';
import { youtubeId, youtubeThumb } from './src/lib/youtube.js';
import { slugify, esc } from './src/lib/html.js';
import { layout } from './src/pages/layout.js';
import { homePage } from './src/pages/home.js';
import { workPage } from './src/pages/work.js';
import { filmPage } from './src/pages/film.js';
import { photographyPage } from './src/pages/photography.js';
import { aboutPage } from './src/pages/about.js';
import { servicesPage } from './src/pages/services.js';
import { contactPage, notFoundPage } from './src/pages/contact.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const CHECK_ONLY = process.argv.includes('--check');
const QUIET = process.argv.includes('--quiet');

const warnings = [];
const warn = (msg) => warnings.push(msg);

class ContentError extends Error {}

// ---------------------------------------------------------------------------
// 1. Load content
// ---------------------------------------------------------------------------

function readJson(relPath) {
  const file = path.join(ROOT, relPath);
  if (!fs.existsSync(file)) throw new ContentError(`Missing file: ${relPath}`);
  const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  try {
    return JSON.parse(text);
  } catch (err) {
    // Turn "Unexpected token } in JSON at position 512" into a line number.
    const pos = Number((String(err.message).match(/position (\d+)/) || [])[1]);
    let where = '';
    if (Number.isFinite(pos)) {
      const before = text.slice(0, pos);
      const line = before.split('\n').length;
      where = ` near line ${line}: "${text.split('\n')[line - 1].trim().slice(0, 80)}"`;
    }
    throw new ContentError(
      `${relPath} is not valid JSON${where}.\n` +
      '  Usual causes: a missing or extra comma, a missing quote, or a quote inside text that needs a backslash (\\").\n' +
      `  (${err.message})`,
    );
  }
}

function loadContent() {
  const site = readJson('content/site.json');
  const projectsFile = readJson('content/projects.json');
  const rawProjects = Array.isArray(projectsFile) ? projectsFile : projectsFile.projects;
  if (!Array.isArray(rawProjects)) throw new ContentError('content/projects.json must contain a "projects" list.');
  const photoNotes = fs.existsSync(path.join(ROOT, 'content/photos.json')) ? readJson('content/photos.json') : {};
  site.url = String(site.url || '').replace(/\/+$/, '');
  if (!/^https?:\/\//.test(site.url)) throw new ContentError('content/site.json: "url" must be the full address, e.g. "https://aydenjenson.com".');
  return { site, rawProjects, photoNotes };
}

// ---------------------------------------------------------------------------
// 2. Turn raw content into the objects the templates use
// ---------------------------------------------------------------------------

function parseAspect(value) {
  if (!value) return 0;
  const m = String(value).match(/^\s*(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)\s*$/);
  if (m) return Number(m[1]) / Number(m[2]);
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function buildProjects(site, rawProjects, media) {
  const categories = site.work.categories;
  const seen = new Set();
  const projects = [];

  rawProjects.forEach((raw, index) => {
    const label = raw.title ? `"${raw.title}"` : `project #${index + 1}`;
    if (!raw.title) throw new ContentError(`content/projects.json: project #${index + 1} has no "title".`);
    const slug = slugify(raw.slug || raw.title);
    if (!slug) throw new ContentError(`content/projects.json: ${label} needs a "slug" (letters, numbers and dashes).`);
    if (seen.has(slug)) throw new ContentError(`content/projects.json: two projects share the slug "${slug}". Each one needs its own.`);
    seen.add(slug);
    if (raw.hidden) return;

    const category = categories.find((c) => c.id === raw.category);
    if (!category) {
      throw new ContentError(
        `content/projects.json: ${label} has category "${raw.category}". ` +
        `It must be one of: ${categories.map((c) => c.id).join(', ')}.`,
      );
    }

    const ytId = youtubeId(raw.youtube);
    if (raw.youtube && !ytId) warn(`${label}: could not read a YouTube video ID from "${raw.youtube}".`);
    const film = media.films[slug] || null;
    const loop = media.loops[slug] || null;
    if (!ytId && !film) {
      warn(`${label}: no video yet (no YouTube link and no media/films/${slug}.mp4). It is left off the site until it has one.`);
      return;
    }

    const localPoster = media.posters[slug];
    const poster = localPoster
      ? { ...localPoster, local: true }
      : { src: youtubeThumb(ytId), width: 1280, height: 720, local: false };
    if (!localPoster && !ytId) warn(`${label}: no poster image (media/posters/${slug}.jpg).`);

    let ratio = parseAspect(raw.aspect);
    if (film?.width && film?.height) ratio = film.width / film.height;
    if (!ratio) ratio = 16 / 9;
    const orientation = ratio < 0.9 ? 'portrait' : ratio < 1.5 ? 'classic' : 'landscape';
    const tileRatio = orientation === 'portrait' ? 0.8 : Math.min(ratio, 2.2);

    projects.push({
      ...raw,
      slug,
      ytId,
      film,
      loop,
      poster,
      ratio: ratio.toFixed(4),
      orientation,
      tileRatio: tileRatio.toFixed(4),
      duration: Math.round(film?.duration || Number(raw.duration) || 0),
      kind: raw.kind || category.label,
      year: raw.year || (raw.date ? Number(String(raw.date).slice(0, 4)) : ''),
      categoryLabel: category.label,
      previewStart: Number(raw.previewStart) || 0,
      url: `/work/${slug}/`,
    });
  });

  if (!projects.length) throw new ContentError('content/projects.json: there are no projects with a video to show.');
  return projects;
}

function buildPhotos(site, media, photoNotes) {
  const configured = site.photography.categories || [];
  const captions = photoNotes.captions || {};
  const labelFor = (folder) => configured.find((c) => c.folder === folder)?.label
    || folder.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const photos = media.photos
    .map((img) => {
      const categoryLabel = labelFor(img.category);
      return {
        ...img,
        categoryLabel,
        alt: captions[img.id] || `${categoryLabel} photography by ${site.name}, ${site.location.city}, ${site.location.region}`,
        full: img.sources[img.sources.length - 1],
      };
    })
    // File names decide the order across every folder: 01-..., 02-..., 03-...
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }) || a.category.localeCompare(b.category));

  const folders = [...new Set([...configured.map((c) => c.folder), ...photos.map((p) => p.category)])];
  const photoCategories = folders.map((folder) => ({
    folder,
    label: labelFor(folder),
    count: photos.filter((p) => p.category === folder).length,
  }));
  return { photos, photoCategories };
}

// ---------------------------------------------------------------------------
// 3. Write files
// ---------------------------------------------------------------------------

// dist/ is updated in place: unchanged files are left alone (so a rebuild does
// not re-copy 200 MB of video), and anything no longer needed is removed at the end.
const written = new Set();

function copyDir(from, to, filter = () => true) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) { copyDir(src, dest, filter); continue; }
    if (!filter(entry.name)) continue;
    written.add(dest);
    const s = fs.statSync(src);
    const d = fs.existsSync(dest) ? fs.statSync(dest) : null;
    if (!d || d.size !== s.size || d.mtimeMs < s.mtimeMs) fs.copyFileSync(src, dest);
  }
}

function writeFile(relPath, contents) {
  const file = path.join(DIST, relPath);
  written.add(file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === contents) return;
  fs.writeFileSync(file, contents);
}

/** Delete files in dist/ that this build did not produce, then any empty folders. */
function prune(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      prune(p);
      if (!fs.readdirSync(p).length) fs.rmdirSync(p);
    } else if (!written.has(p)) {
      fs.rmSync(p, { force: true });
    }
  }
}

/** '/work/' -> 'work/index.html', '/404.html' -> '404.html' */
const outPath = (urlPath) => (urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath).replace(/^\//, '');

function redirectPage(ctx, to) {
  const target = ctx.abs(to);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="${esc(target)}">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${esc(to)}">
<script>location.replace(${JSON.stringify(to)} + location.hash);</script>
</head>
<body><p>This page has moved to <a href="${esc(to)}">${esc(target)}</a>.</p></body>
</html>
`;
}

function sitemap(ctx, pages) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.filter((p) => !p.noindex).map((p) => {
    const images = p.id === 'photography'
      ? ctx.photos.map((img) => `\n    <image:image><image:loc>${esc(ctx.abs(img.full.src))}</image:loc></image:image>`).join('')
      : '';
    const priority = p.path === '/' ? '1.0' : p.id === 'film' ? '0.6' : '0.8';
    return `  <url>\n    <loc>${esc(ctx.abs(p.path))}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>${images}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
}

function dirSize(dir) {
  let total = 0;
  const files = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else { const s = fs.statSync(p).size; total += s; files.push({ file: path.relative(DIST, p), size: s }); }
    }
  };
  walk(dir);
  return { total, files };
}

// ---------------------------------------------------------------------------
// 4. Build
// ---------------------------------------------------------------------------

export function build() {
  const started = Date.now();
  warnings.length = 0;

  const { site, rawProjects, photoNotes } = loadContent();
  const media = scanMedia(ROOT);
  const projects = buildProjects(site, rawProjects, media);
  const { photos, photoCategories } = buildPhotos(site, media, photoNotes);
  const featured = projects.filter((p) => p.featured);

  // Cache-busting: /assets/css/main.css -> /assets/css/main.css?v=1a2b3c4d
  const hashes = new Map();
  const asset = (urlPath) => {
    if (!hashes.has(urlPath)) {
      const file = path.join(ROOT, 'src', urlPath);
      const hash = fs.existsSync(file)
        ? crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 8)
        : 'dev';
      hashes.set(urlPath, `${urlPath}?v=${hash}`);
    }
    return hashes.get(urlPath);
  };

  const ctx = {
    site,
    projects,
    featured: featured.length ? featured : projects.slice(0, 6),
    photos,
    photoCategories,
    media,
    asset,
    abs: (p) => (/^https?:\/\//.test(p) ? p : `${site.url}${p.startsWith('/') ? p : `/${p}`}`),
    year: new Date().getFullYear(),
  };

  const pages = [
    homePage(ctx),
    workPage(ctx),
    ...projects.map((p) => filmPage(ctx, p)),
    photographyPage(ctx),
    aboutPage(ctx),
    servicesPage(ctx),
    contactPage(ctx),
    notFoundPage(ctx),
  ];

  for (const slug of site.home?.heroProjects || []) {
    const p = projects.find((x) => x.slug === slug);
    if (!p) warn(`content/site.json: home.heroProjects lists "${slug}", which is not a project slug. It is skipped.`);
    else if (!p.loop) warn(`Home page title "${p.title}" has no preview loop, so opening it shows a still picture instead of footage.`);
  }

  // Helpful notes about things that would make the site better.
  const noLoop = projects.filter((p) => !p.loop).map((p) => p.slug);
  if (noLoop.length) warn(`${noLoop.length} project(s) have no preview loop yet (they show a still image instead): ${noLoop.join(', ')}`);
  const noPoster = projects.filter((p) => !p.poster.local).map((p) => p.slug);
  if (noPoster.length) warn(`${noPoster.length} project(s) use the YouTube thumbnail as their poster: ${noPoster.join(', ')}`);
  if (!photos.length) warn('No photos found in media/photos/<category>/. The photography page is empty.');
  if (!media.about.portrait) warn('No portrait found at media/about/portrait.jpg.');
  if (!site.form?.web3formsKey) warn('Contact form: no Web3Forms key in content/site.json, so the form opens the visitor\'s email app instead of sending directly.');

  if (CHECK_ONLY) return { pages, warnings: [...warnings], ms: Date.now() - started };

  written.clear();
  fs.mkdirSync(DIST, { recursive: true });

  for (const page of pages) writeFile(outPath(page.path), layout(ctx, page));

  for (const r of site.redirects || []) {
    const from = `/${String(r.from).replace(/^\/+|\/+$/g, '')}/`;
    if (pages.some((p) => p.path === from)) continue; // never overwrite a real page
    writeFile(outPath(from), redirectPage(ctx, r.to));
  }

  copyDir(path.join(ROOT, 'src', 'assets'), path.join(DIST, 'assets'));
  copyDir(path.join(ROOT, 'media'), path.join(DIST, 'media'), (name) => !name.startsWith('.') && !/\.(md|txt)$/i.test(name));
  copyDir(path.join(ROOT, 'public'), DIST);

  writeFile('sitemap.xml', sitemap(ctx, pages));
  if (!fs.existsSync(path.join(ROOT, 'public', 'robots.txt'))) {
    writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  }
  writeFile('.nojekyll', '');
  prune(DIST);

  const { total, files } = dirSize(DIST);
  const tooBig = files.filter((f) => f.size > 95 * 1024 * 1024);
  if (tooBig.length) {
    throw new ContentError(`These files are over 95 MB and GitHub will reject them:\n${tooBig.map((f) => `  ${f.file} (${(f.size / 1048576).toFixed(0)} MB)`).join('\n')}`);
  }
  if (total > 900 * 1024 * 1024) warn(`The built site is ${(total / 1048576).toFixed(0)} MB. GitHub Pages allows 1 GB, so it is time to move the larger videos elsewhere.`);

  return { pages, warnings: [...warnings], ms: Date.now() - started, bytes: total, files: files.length };
}

// Run when called directly (not when imported by dev.js).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = build();
    if (!QUIET) {
      for (const w of result.warnings) console.log(`  note: ${w}`);
      console.log(CHECK_ONLY
        ? `Content looks good: ${result.pages.length} pages would be built.`
        : `Built ${result.pages.length} pages, ${result.files} files, ${(result.bytes / 1048576).toFixed(1)} MB in ${result.ms} ms -> dist/`);
    }
  } catch (err) {
    if (err instanceof ContentError) {
      console.error(`\nThe site could not be built:\n\n  ${err.message}\n`);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}
