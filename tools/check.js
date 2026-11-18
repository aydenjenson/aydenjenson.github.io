#!/usr/bin/env node
// Sanity check of the built site: `node tools/check.js` (run `node build.js` first).
// Verifies that every internal link, image, video, script and stylesheet in
// dist/ points at a file that exists, that structured data is valid JSON, and
// that every page has the tags search engines need.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!fs.existsSync(DIST)) { console.error('No dist/ folder. Run `node build.js` first.'); process.exit(1); }

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) pages.push(p);
  }
})(DIST);

const problems = [];
const titles = new Map();
let links = 0;

/** Does a root-relative URL resolve to a file in dist/? */
function exists(url) {
  const clean = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!clean) return true;
  const target = path.join(DIST, clean);
  if (clean.endsWith('/')) return fs.existsSync(path.join(target, 'index.html'));
  return fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'));
}

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = `/${path.relative(DIST, file).replace(/\\/g, '/')}`;
  const isRedirect = html.includes('http-equiv="refresh"');

  const urls = [
    ...[...html.matchAll(/\s(?:href|src|poster|data-src|data-poster|data-loop|data-loop-hd|data-preview)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((part) => part.trim().split(/\s+/)[0])),
  ];
  for (const url of urls) {
    if (!url.startsWith('/') || url.startsWith('//')) continue; // external links, mailto:, #anchors
    links += 1;
    if (!exists(url)) problems.push(`${rel}: missing ${url}`);
  }

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (error) { problems.push(`${rel}: structured data is not valid JSON (${error.message})`); }
  }

  if (isRedirect) continue;
  // The design options pages (lab/) exist only in the local preview and are never
  // published, so their links are checked above but their search tags are not.
  if (rel.startsWith('/lab/')) continue;
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) problems.push(`${rel}: no <title>`);
  if (!description) problems.push(`${rel}: no meta description`);
  if (!/<link rel="canonical" href="https:\/\//.test(html)) problems.push(`${rel}: no canonical link`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${rel}: should have exactly one <h1>, found ${(html.match(/<h1[\s>]/g) || []).length}`);
  if (title && title.length > 70) problems.push(`${rel}: title is ${title.length} characters (Google cuts off around 60 to 70): "${title}"`);
  if (description && description.length > 170) problems.push(`${rel}: description is ${description.length} characters (aim for under 160)`);
  if (title) {
    if (titles.has(title)) problems.push(`${rel}: same <title> as ${titles.get(title)}`);
    titles.set(title, rel);
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) problems.push(`${rel}: image without alt attribute: ${m[0].slice(0, 80)}`);
  }
}

console.log(`Checked ${pages.length} pages and ${links} internal links.`);
if (problems.length) {
  console.log(`\n${problems.length} thing(s) to look at:\n`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('Everything resolves. No problems found.');
