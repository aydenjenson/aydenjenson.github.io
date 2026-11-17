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
//   node tools/media.js grade  <video-or-image> <name> [--at 5.3] [--crop w:h:x:y] --before <ungraded image or video> [--before-at 5.3]
//       Before/after pair    -> media/grades/<name>-after.webp and <name>-before.webp (the slider on the home page)
//       <name> is a number for the order, then the project slug, then an optional label: 05-the-beauty-of-color-grading-dirt-bike
//       With --fake instead of --before, a stand-in "before" is made from the finished frame: <name>-before-sim.webp
//
//   node tools/media.js portrait <image>       -> media/about/portrait-*.webp
//   node tools/media.js og <image-or-video> [--at 4]   -> public/og.jpg (link preview image)
//   node tools/media.js youtube-posters        Download YouTube thumbnails for projects with no poster
//   node tools/media.js thumbs                 Rebuild the small poster copies in media/posters/thumbs/
//   node tools/media.js loop-stills            Rebuild the first-frame images next to each loop
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
  makeLoopStills(slug);
  makePoster(input, slug, { at: at !== undefined ? at : from + Math.min(1.5, length / 2), force: at !== undefined, crop });
}

/**
 * First frame of a loop as an image: media/loops/<slug>.jpg plus a tiny
 * <slug>-sm.jpg. The home page shows these (blurred) before the loop plays,
 * so the picture never jumps when the video starts.
 */
function makeLoopStills(slug) {
  const dir = path.join(MEDIA, 'loops');
  const source = [`${slug}-hd.mp4`, `${slug}.mp4`].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
  if (!source) return;
  run('ffmpeg', ['-v', 'error', '-y', '-i', source, '-frames:v', '1', '-update', '1', '-vf', 'format=yuvj420p', '-q:v', '3', path.join(dir, `${slug}.jpg`)]);
  run('ffmpeg', ['-v', 'error', '-y', '-i', source, '-frames:v', '1', '-update', '1', '-vf', `${scaleFilter(480)},format=yuvj420p`, '-q:v', '6', path.join(dir, `${slug}-sm.jpg`)]);
  console.log(`  still   media/loops/${slug}.jpg and ${slug}-sm.jpg`);
}

function makeAllLoopStills() {
  const dir = path.join(MEDIA, 'loops');
  const slugs = [...new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.mp4')).map((f) => f.replace(/(-hd)?\.mp4$/, '')))];
  slugs.forEach(makeLoopStills);
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

/* --------------------------------------------------- before / after pairs ---- */

// Fujifilm F-Log, from Fujifilm's F-Log data sheet: scene reflection -> code value (0..1).
const FLOG = { a: 0.555556, b: 0.009468, c: 0.344676, d: 0.790453, e: 8.735631, f: 0.092864, cut: 0.00089 };
const flog = (x) => (x < FLOG.cut ? FLOG.e * x + FLOG.f : FLOG.c * Math.log10(FLOG.a * x + FLOG.b) + FLOG.d);

// How a finished (graded) frame is turned back into something that looks like
// the flat F-Log footage it started as. The numbers were fitted on 2026-11-17
// against the real before/after pairs in "The Beauty of Color Grading"
// (Fujifilm X-T3), so a stand-in "before" does not look out of place next to
// the real ones:
//   contrast               the grade's contrast is undone around middle grey
//   exposure, highlights   the bright end is opened back up
//   shadowColor, color     how much colour is kept in the shadows and above them
//   knee                   the brightness where shadows hand over to highlights
//   red*, blue*            his grades cool the shadows and warm the highlights; this takes that back out
//   offset, gain           where black and white sit in the flat picture
//   colorfulCut            a very colourful grade loses more colour on the way back
//   neutral                how much of the tint left in a frame's own darkest and brightest areas is removed (0 to 1)
const UNGRADE = {
  contrast: 2.0882, exposure: 1.4519, highlights: 1.5757,
  shadowColor: 0.8844, color: 0.9331, knee: 0.4047,
  redShadow: 0.1309, redSlope: -0.2646, blueShadow: -0.0449, blueSlope: 0.5227,
  offset: 0.0142, gain: 0.9193,
  colorfulCut: 1.775,
  neutral: 0.6,
};
const TO_FGAMUT = [[0.6274, 0.3293, 0.0433], [0.0691, 0.9195, 0.0114], [0.0164, 0.0880, 0.8956]]; // Rec.709 -> Rec.2020 primaries, which F-Gamut uses

/** "P6\n<width> <height>\n255\n" followed by width * height * 3 bytes of RGB. */
function parsePpm(buffer) {
  const space = (byte) => byte === 0x20 || byte === 0x0a || byte === 0x0d || byte === 0x09;
  const fields = [];
  let pos = 0;
  while (fields.length < 4) {
    while (space(buffer[pos])) pos += 1;
    let end = pos;
    while (end < buffer.length && !space(buffer[end])) end += 1;
    fields.push(buffer.toString('latin1', pos, end));
    pos = end;
  }
  pos += 1; // one whitespace byte separates the header from the pixels
  const width = Number(fields[1]);
  const height = Number(fields[2]);
  if (fields[0] !== 'P6' || fields[3] !== '255' || !width || !height) throw new Error('FFmpeg returned picture data in an unexpected form.');
  return { width, height, data: buffer.subarray(pos, pos + width * height * 3) };
}

/** One frame of a video (at a time, or an exact frame number) or an image, as raw RGB no wider than `edge`. */
function readFrame(input, { at, frame, crop, edge = 1920 } = {}) {
  const args = ['-v', 'error'];
  const filters = [];
  if (!isImage(input)) {
    if (frame !== undefined) filters.push(`select=eq(n\\,${Number(frame)})`);
    else args.push('-ss', String(at !== undefined ? Number(at) : probe(input).duration * 0.35));
  }
  args.push('-i', input);
  if (crop) filters.push(`crop=${crop}`);
  filters.push(scaleFilter(edge));
  args.push('-vf', filters.join(','), '-frames:v', '1', '-f', 'image2pipe', '-c:v', 'ppm', '-');
  const result = spawnSync('ffmpeg', args, { maxBuffer: 256 * 1024 * 1024 });
  if (result.error) fail(`Could not run ffmpeg. Is FFmpeg installed? (${result.error.message})`);
  if (result.status !== 0 || !result.stdout.length) {
    throw new Error(`ffmpeg could not read a frame from ${path.basename(input)}:\n    ${String(result.stderr).trim().split('\n').slice(-3).join('\n    ')}`);
  }
  return parsePpm(result.stdout);
}

function writeWebp(image, out) {
  const header = Buffer.from(`P6\n${image.width} ${image.height}\n255\n`, 'latin1');
  const result = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'ppm', '-i', '-', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '84', '-compression_level', '6', '-preset', 'photo', out],
    { input: Buffer.concat([header, image.data]), maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`ffmpeg could not write ${path.basename(out)}:\n    ${String(result.stderr).trim().split('\n').slice(-3).join('\n    ')}`);
}

/** A stand-in for the ungraded frame, made from the finished one (see UNGRADE above). */
function ungrade(image, seed) {
  const u = UNGRADE;
  const pivot = 0.18;
  const linear = new Float64Array(256);
  for (let v = 0; v < 256; v += 1) {
    const light = (v / 255) ** 2.4;
    const s = u.exposure * pivot * (light / pivot) ** (1 / u.contrast);
    linear[v] = s / Math.max(1 - u.highlights * s, 0.05);
  }
  // A trace of grain (the same on every run), so the lifted shadows do not
  // show the blocks left by the compression of the finished film.
  let state = (seed >>> 0) || 1;
  const random = () => {
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5; state >>>= 0;
    return state / 4294967296;
  };
  const src = image.data;
  const count = src.length / 3;
  const flat = new Float32Array(src.length);
  const luma = new Float32Array(count);
  const [m0, m1, m2] = TO_FGAMUT;
  // How colourful the finished frame is, 0..1 (the average gap between its strongest and weakest channel).
  let chroma = 0;
  for (let i = 0; i < src.length; i += 3) chroma += Math.max(src[i], src[i + 1], src[i + 2]) - Math.min(src[i], src[i + 1], src[i + 2]);
  chroma /= count * 255;
  const keep = Math.exp(-u.colorfulCut * (chroma - 0.18));
  for (let i = 0, j = 0; i < src.length; i += 3, j += 1) {
    const r = linear[src[i]];
    const g = linear[src[i + 1]];
    const b = linear[src[i + 2]];
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const t = y / (y + u.knee); // 0 in the shadows, towards 1 in the highlights
    const sat = keep * (u.shadowColor + (u.color - u.shadowColor) * t);
    const dr = y + sat * (r - y);
    const dg = y + sat * (g - y);
    const db = y + sat * (b - y);
    const red = Math.exp(u.redShadow + u.redSlope * t);
    const blue = Math.exp(u.blueShadow + u.blueSlope * t);
    flat[i] = u.offset + u.gain * flog(Math.max(0, red * (m0[0] * dr + m0[1] * dg + m0[2] * db)));
    flat[i + 1] = u.offset + u.gain * flog(Math.max(0, m1[0] * dr + m1[1] * dg + m1[2] * db));
    flat[i + 2] = u.offset + u.gain * flog(Math.max(0, blue * (m2[0] * dr + m2[1] * dg + m2[2] * db)));
    luma[j] = (flat[i] + flat[i + 1] + flat[i + 2]) / 3;
  }

  // Real ungraded footage is close to neutral in its darkest and brightest
  // areas. Whatever tint this frame still has there is the grade's, so most of
  // it is taken out (measured on this frame: its darkest and brightest tenths).
  const sorted = Float32Array.from(luma).sort();
  const low = sorted[Math.floor(count * 0.1)];
  const high = sorted[Math.floor(count * 0.9)];
  const tintOf = (inRange) => {
    const sum = [0, 0, 0];
    let n = 0;
    for (let j = 0; j < count; j += 1) {
      if (!inRange(luma[j])) continue;
      sum[0] += flat[j * 3] - luma[j];
      sum[1] += flat[j * 3 + 1] - luma[j];
      sum[2] += flat[j * 3 + 2] - luma[j];
      n += 1;
    }
    return sum.map((v) => v / Math.max(1, n));
  };
  const shadowTint = tintOf((l) => l <= low);
  const highTint = tintOf((l) => l >= high);
  const span = Math.max(1e-6, high - low);

  const out = Buffer.allocUnsafe(src.length);
  const byte = (x) => Math.max(0, Math.min(255, Math.round(x * 255)));
  for (let i = 0, j = 0; i < src.length; i += 3, j += 1) {
    const w = Math.max(0, Math.min(1, (luma[j] - low) / span));
    const grain = (random() + random() - 1) * 0.007;
    out[i] = byte(flat[i] - u.neutral * ((1 - w) * shadowTint[0] + w * highTint[0]) + grain);
    out[i + 1] = byte(flat[i + 1] - u.neutral * ((1 - w) * shadowTint[1] + w * highTint[1]) + grain);
    out[i + 2] = byte(flat[i + 2] - u.neutral * ((1 - w) * shadowTint[2] + w * highTint[2]) + grain);
  }
  return { width: image.width, height: image.height, data: out };
}

/**
 * One before/after pair for the color grading slider.
 *   after    a frame of the finished film (--at seconds, or --frame number)
 *   before   the same frame ungraded: --before <image or video> (with --before-at
 *            or --before-frame for a video), or --before-at / --before-frame alone
 *            when the ungraded version is in the same file.
 *   --fake   there is no ungraded frame: make a stand-in from the finished one.
 *            It is saved as <name>-before-sim.webp so it is never mistaken for a real one.
 */
function makeGrade(input, name, flags = {}) {
  const base = slugify(name || '');
  if (!base) fail('Missing the name: a number for the order, then the project slug, for example 03-seraphim-studios.');
  const dir = path.join(MEDIA, 'grades');
  ensureDir(dir);
  const given = (key) => flags[key] !== undefined && flags[key] !== true;
  const after = readFrame(input, { at: flags.at, frame: flags.frame, crop: flags.crop });

  let before;
  let suffix = 'before';
  if (given('before') || given('before-at') || given('before-frame')) {
    const source = given('before') ? needFile(String(flags.before)) : input;
    before = readFrame(source, {
      at: given('before-at') ? flags['before-at'] : (given('before-frame') ? undefined : flags.at),
      frame: given('before-frame') ? flags['before-frame'] : undefined,
      crop: given('before-crop') ? flags['before-crop'] : flags.crop,
    });
    if (before.width !== after.width || before.height !== after.height) {
      throw new Error(`The "before" frame is ${before.width}x${before.height} and the "after" frame is ${after.width}x${after.height}. They must be the same size.`);
    }
  } else if (flags.fake) {
    let seed = 2166136261;
    for (const ch of base) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
    before = ungrade(after, seed);
    suffix = 'before-sim';
  } else {
    fail('A pair needs the ungraded frame too: add --before <file> (or --before-at / --before-frame), or --fake to make a stand-in.');
  }

  // Remove older files of this pair so a real "before" replaces a stand-in cleanly.
  for (const f of fs.readdirSync(dir)) {
    if (new RegExp(`^${base}-(after|before|before-sim)\\.(webp|jpe?g|png)$`).test(f)) fs.unlinkSync(path.join(dir, f));
  }
  const afterFile = path.join(dir, `${base}-after.webp`);
  const beforeFile = path.join(dir, `${base}-${suffix}.webp`);
  writeWebp(after, afterFile);
  writeWebp(before, beforeFile);
  console.log(`  grade   media/grades/${base}-after.webp (${mb(afterFile)} MB), ${path.basename(beforeFile)} (${mb(beforeFile)} MB)  ${after.width}x${after.height}${suffix === 'before-sim' ? '  stand-in "before"' : ''}`);
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
      await dispatch(job.cmd, [job.input, job.slug || job.category || job.name].filter(Boolean), job);
    } catch (error) {
      console.log(`  FAILED  ${job.cmd} ${job.slug || job.category || job.name || ''}: ${error.message}`);
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
    case 'grade': return makeGrade(needFile(a), b, flags);
    case 'portrait': return makePortrait(needFile(a));
    case 'og': return makeOg(needFile(a), flags);
    case 'youtube-posters': await youtubePosters(); return makeAllThumbs();
    case 'thumbs': return makeAllThumbs();
    case 'loop-stills': return makeAllLoopStills();
    case 'batch': return batch(a);
    default:
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 32).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
      return undefined;
  }
}

const [command, ...rest] = process.argv.slice(2);
const { positional, flags } = parseArgs(rest);
dispatch(command, positional, flags).catch((error) => fail(error.message));
