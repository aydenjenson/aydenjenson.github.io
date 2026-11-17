#!/usr/bin/env node
// Turns original camera exports into small web files inside media/.
// Needs FFmpeg installed (it is: `ffmpeg -version`). No other dependencies.
//
//   node tools/media.js loop   <video> <project-slug> [--start 3] [--dur 8] [--hd]
//       Silent preview loop  -> media/loops/<slug>.mp4      (720p, ~1-2 MB)
//       with --hd also       -> media/loops/<slug>-hd.mp4   (1080p, for the home hero)
//       and a poster         -> media/posters/<slug>.jpg    (unless one exists)
//
//   node tools/media.js film   <video> <project-slug> [--max-mb 30]
//       Full film with sound -> media/films/<slug>.mp4      (1080p)
//       The project page then plays this file instead of YouTube.
//
//   node tools/media.js poster <video-or-image> <project-slug> [--at 4]
//       Still frame          -> media/posters/<slug>.jpg
//
//   node tools/media.js photo  <image-or-folder> <category> [--name 07-barber]
//       Web sizes            -> media/photos/<category>/<name>-900.webp, -1700.webp, -2500.webp
//
//   node tools/media.js portrait <image>       -> media/about/portrait-*.webp
//   node tools/media.js og <image-or-video> [--at 4]   -> public/og.jpg (link preview image)
//   node tools/media.js youtube-posters        Download YouTube thumbnails for projects with no poster
//   node tools/media.js thumbs                 Rebuild the small poster copies in media/posters/thumbs/
//   node tools/media.js batch <file.json>      Run many of the above from a list (see tools/media-sources.json)
//
// Originals are never modified. Run `node build.js` afterwards to see the result.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA = path.join(ROOT, 'media');

/* ----------------------------------------------------------------- helpers ---- */

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

function run(bin, args, { quiet = true } = {}) {
  const result = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) fail(`Could not run ${bin}. Is FFmpeg installed? (${result.error.message})`);
  if (result.status !== 0) {
    const tail = String(result.stderr || '').trim().split('\n').slice(-6).join('\n    ');
    throw new Error(`${bin} failed:\n    ${tail}`);
  }
  if (!quiet) process.stdout.write(result.stdout || '');
  return result.stdout || '';
}

function probe(file) {
  const json = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height:stream_side_data=rotation', '-of', 'json', file]));
  const video = (json.streams || []).find((s) => s.codec_type === 'video') || {};
  const rotation = Math.abs(Number((video.side_data_list || []).find((d) => d.rotation !== undefined)?.rotation || 0));
  const swap = rotation === 90 || rotation === 270;
  return {
    duration: Number(json.format?.duration || 0),
    width: swap ? video.height : video.width,
    height: swap ? video.width : video.height,
    hasAudio: (json.streams || []).some((s) => s.codec_type === 'audio'),
  };
}

const mb = (file) => (fs.statSync(file).size / 1048576).toFixed(1);
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const isImage = (file) => /\.(jpe?g|png|webp|tiff?|heic)$/i.test(file);

function slugify(text) {
  return String(text).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) flags[key] = true;
      else { flags[key] = next; i += 1; }
    } else positional.push(arg);
  }
  return { positional, flags };
}

function needFile(file) {
  if (!file) fail('Missing the input file. Run `node tools/media.js` to see the commands.');
  if (!fs.existsSync(file)) fail(`File not found: ${file}`);
  return file;
}

function projectSlugs() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'projects.json'), 'utf8'));
    return (Array.isArray(data) ? data : data.projects).map((p) => ({ ...p, slug: slugify(p.slug || p.title) }));
  } catch { return []; }
}

function checkSlug(slug) {
  if (!slug) fail('Missing the project slug (the "slug" of the project in content/projects.json).');
  const known = projectSlugs().map((p) => p.slug);
  if (known.length && !known.includes(slug)) {
    console.log(`  note: "${slug}" is not a slug in content/projects.json yet. Known slugs:\n    ${known.join(', ')}`);
  }
  return slug;
}

/** Scale so the longer edge is at most `edge` pixels, never enlarging, even dimensions. */
const scaleFilter = (edge) => `scale='if(gt(iw,ih),min(${edge},iw),-2)':'if(gt(iw,ih),-2,min(${edge},ih))':flags=lanczos`;

/* ---------------------------------------------------------------- commands ---- */

/** Optional "--crop w:h:x:y" removes black bars that are baked into a clip before it is scaled. */
const cropFilter = (crop) => (crop ? `crop=${crop},` : '');

function makePoster(input, slug, { at, force = true, crop } = {}) {
  const out = path.join(MEDIA, 'posters', `${slug}.jpg`);
  if (!force && fs.existsSync(out)) return out;
  ensureDir(path.dirname(out));
  const args = ['-v', 'error', '-y'];
  if (!isImage(input)) {
    const { duration } = probe(input);
    const time = at !== undefined ? Number(at) : Math.max(0.2, duration * 0.35);
    args.push('-ss', String(time));
  }
  args.push('-i', input, '-frames:v', '1', '-update', '1', '-vf', `${cropFilter(crop)}${scaleFilter(1920)},format=yuvj420p`, '-q:v', '3', out);
  run('ffmpeg', args);
  console.log(`  poster  media/posters/${slug}.jpg  (${mb(out)} MB)`);
  makeThumb(out);
  return out;
}

/** Small copy of a poster for the work wall and lists: media/posters/thumbs/<slug>.jpg */
function makeThumb(posterFile) {
  const dir = path.join(MEDIA, 'posters', 'thumbs');
  ensureDir(dir);
  const out = path.join(dir, path.basename(posterFile).replace(/\.(jpe?g|png|webp)$/i, '.jpg'));
  run('ffmpeg', ['-v', 'error', '-y', '-i', posterFile, '-frames:v', '1', '-update', '1', '-vf', `${scaleFilter(720)},format=yuvj420p`, '-q:v', '5', out]);
  return out;
}

function makeAllThumbs() {
  const dir = path.join(MEDIA, 'posters');
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  files.forEach((f) => makeThumb(path.join(dir, f)));
  console.log(`  thumbs  media/posters/thumbs/  ${files.length} files`);
}

function makeLoop(input, slug, { start, dur, hd = false, at, crop } = {}) {
  const info = probe(input);
  const length = Math.min(Number(dur) || (hd ? 10 : 8), Math.max(1, info.duration - 0.2));
  const from = start !== undefined ? Number(start) : Math.max(0, Math.min(info.duration - length, info.duration * 0.12));
  ensureDir(path.join(MEDIA, 'loops'));

  const encode = (edge, crf, maxrate, name) => {
    const out = path.join(MEDIA, 'loops', name);
    run('ffmpeg', [
      '-v', 'error', '-y', '-ss', String(from), '-t', String(length), '-i', input,
      '-an', '-vf', `${cropFilter(crop)}${scaleFilter(edge)},format=yuv420p`,
      '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-crf', String(crf),
      '-maxrate', `${maxrate}k`, '-bufsize', `${maxrate * 2}k`,
      '-movflags', '+faststart', out,
    ]);
    console.log(`  loop    media/loops/${name}  (${mb(out)} MB, ${length.toFixed(1)}s from ${from.toFixed(1)}s)`);
  };

  encode(1280, 27, 1800, `${slug}.mp4`);
  if (hd) encode(1920, 24, 4500, `${slug}-hd.mp4`);
  makePoster(input, slug, { at: at !== undefined ? at : from + Math.min(1.5, length / 2), force: at !== undefined, crop });
}

function makeFilm(input, slug, { maxMb = 30 } = {}) {
  const info = probe(input);
  ensureDir(path.join(MEDIA, 'films'));
  const out = path.join(MEDIA, 'films', `${slug}.mp4`);
  const limit = Number(maxMb);
  const audioK = info.hasAudio ? 160 : 0;
  // Bitrate that would land on the size limit, capped so short films don't get absurdly large.
  let maxrate = Math.min(6500, Math.floor((limit * 8192) / Math.max(1, info.duration) - audioK));
  let crf = 22;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const args = [
      '-v', 'error', '-y', '-i', input,
      '-vf', `${scaleFilter(1920)},format=yuv420p`,
      '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-crf', String(crf),
      '-maxrate', `${maxrate}k`, '-bufsize', `${maxrate * 2}k`,
    ];
    if (info.hasAudio) args.push('-c:a', 'aac', '-b:a', `${audioK}k`, '-ac', '2', '-ar', '48000');
    else args.push('-an');
    args.push('-movflags', '+faststart', out);
    run('ffmpeg', args);
    if (fs.statSync(out).size <= limit * 1048576) break;
    crf += 2;
    maxrate = Math.floor(maxrate * 0.85);
  }
  console.log(`  film    media/films/${slug}.mp4  (${mb(out)} MB, ${info.duration.toFixed(1)}s, ${info.width}x${info.height} source)`);
  makePoster(input, slug, { force: false });
}

function makePhoto(input, category, { name } = {}) {
  if (!category) fail('Missing the category folder name, for example: brand, people, events, explore.');
  const files = fs.statSync(input).isDirectory()
    ? fs.readdirSync(input).filter(isImage).sort().map((f) => path.join(input, f))
    : [input];
  if (!files.length) fail(`No images found in ${input}`);
  const dir = path.join(MEDIA, 'photos', slugify(category));
  ensureDir(dir);

  files.forEach((file, index) => {
    const base = name && files.length === 1 ? name : `${name ? `${name}-` : ''}${slugify(path.basename(file, path.extname(file)))}`;
    writeSizes(file, dir, files.length > 1 && name ? `${name}-${String(index + 1).padStart(2, '0')}` : base, [900, 1700, 2500]);
  });
}

function makePortrait(input) {
  const dir = path.join(MEDIA, 'about');
  ensureDir(dir);
  writeSizes(input, dir, 'portrait', [900, 1700]);
}

/** Write one .webp per long-edge size, skipping sizes bigger than the original. */
function writeSizes(file, dir, base, edges) {
  const { width, height } = probe(file);
  const longest = Math.max(width, height);
  const wanted = edges.filter((e, i) => e <= longest || i === 0);
  if (longest < edges[edges.length - 1] && !wanted.includes(longest) && longest > wanted[wanted.length - 1]) wanted.push(longest);
  // Remove older copies of this photo so sizes never go stale.
  for (const f of fs.readdirSync(dir)) if (new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d{3,4}\\.webp$`).test(f)) fs.unlinkSync(path.join(dir, f));
  const written = wanted.map((edge) => {
    const out = path.join(dir, `${base}-${Math.min(edge, longest)}.webp`);
    run('ffmpeg', ['-v', 'error', '-y', '-i', file, '-frames:v', '1', '-vf', `${scaleFilter(edge)}`, '-c:v', 'libwebp', '-quality', '84', '-compression_level', '6', '-preset', 'photo', out]);
    return `${path.basename(out)} ${mb(out)} MB`;
  });
  console.log(`  photo   ${path.relative(ROOT, dir).replace(/\\/g, '/')}/  ${written.join(', ')}`);
}

function makeOg(input, { at } = {}) {
  const out = path.join(ROOT, 'public', 'og.jpg');
  ensureDir(path.dirname(out));
  const args = ['-v', 'error', '-y'];
  if (!isImage(input)) args.push('-ss', String(at !== undefined ? Number(at) : probe(input).duration * 0.35));
  args.push('-i', input, '-frames:v', '1', '-vf', "scale=1200:630:force_original_aspect_ratio=increase:flags=lanczos,crop=1200:630,format=yuvj420p", '-q:v', '3', out);
  run('ffmpeg', args);
  console.log(`  og      public/og.jpg  (${mb(out)} MB)`);
}

async function youtubePosters() {
  const dir = path.join(MEDIA, 'posters');
  ensureDir(dir);
  for (const p of projectSlugs()) {
    const id = (String(p.youtube || '').match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([\w-]{11})/) || [])[1] || (/^[\w-]{11}$/.test(p.youtube || '') ? p.youtube : '');
    if (!id) continue;
    if (fs.readdirSync(dir).some((f) => f.replace(/\.(jpe?g|png|webp)$/i, '') === p.slug)) continue;
    let saved = false;
    for (const size of ['maxresdefault', 'sddefault', 'hqdefault']) {
      const response = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`);
      if (!response.ok) continue;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 3000) continue; // YouTube's grey "no thumbnail" placeholder
      fs.writeFileSync(path.join(dir, `${p.slug}.jpg`), bytes);
      console.log(`  poster  media/posters/${p.slug}.jpg  (YouTube ${size}, ${(bytes.length / 1024).toFixed(0)} KB)`);
      saved = true;
      break;
    }
    if (!saved) console.log(`  note: no YouTube thumbnail found for ${p.slug}`);
  }
}

async function batch(file) {
  const jobs = JSON.parse(fs.readFileSync(needFile(file), 'utf8'));
  for (const job of Array.isArray(jobs) ? jobs : jobs.jobs) {
    if (job.skip) continue;
    try {
      await dispatch(job.cmd, [job.input, job.slug || job.category].filter(Boolean), job);
    } catch (error) {
      console.log(`  FAILED  ${job.cmd} ${job.slug || job.category || ''}: ${error.message}`);
    }
  }
}

async function dispatch(cmd, positional, flags) {
  const [a, b] = positional;
  switch (cmd) {
    case 'loop': return makeLoop(needFile(a), checkSlug(b), flags);
    case 'film': return makeFilm(needFile(a), checkSlug(b), { maxMb: flags['max-mb'] || flags.maxMb || 30 });
    case 'poster': return makePoster(needFile(a), checkSlug(b), flags);
    case 'photo': return makePhoto(needFile(a), b, flags);
    case 'portrait': return makePortrait(needFile(a));
    case 'og': return makeOg(needFile(a), flags);
    case 'youtube-posters': await youtubePosters(); return makeAllThumbs();
    case 'thumbs': return makeAllThumbs();
    case 'batch': return batch(a);
    default:
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 27).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
      return undefined;
  }
}

const [command, ...rest] = process.argv.slice(2);
const { positional, flags } = parseArgs(rest);
dispatch(command, positional, flags).catch((error) => fail(error.message));
