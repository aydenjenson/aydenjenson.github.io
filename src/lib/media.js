// Scans the media/ folder so pages know which loops, films, posters and
// photos exist. Everything here is driven by FILE NAMES, never by a list you
// have to maintain:
//
//   media/loops/<project-slug>.mp4        short silent preview loop (720p)
//   media/loops/<project-slug>-hd.mp4     optional 1080p version for the home hero
//   media/films/<project-slug>.mp4        full film hosted on the site (optional)
//   media/posters/<project-slug>.jpg      still frame used before video loads
//   media/photos/<category>/<name>.jpg    photography page (one folder per category)
//   media/photos/<category>/<name>-800.webp, -1600.webp, -2400.webp
//                                         optional web sizes made by tools/media.js
//   media/about/portrait.jpg              about page portrait
import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from './image-size.js';
import { mp4Info } from './mp4.js';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const SIZED = /^(.*)-(\d{3,4})$/; // "barber-1600" -> ["barber", "1600"]

const list = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : []);

export function scanMedia(root) {
  const mediaDir = path.join(root, 'media');
  const url = (...parts) => `/media/${parts.join('/')}`;

  // ---- preview loops -------------------------------------------------------
  const loops = {};
  for (const f of list(path.join(mediaDir, 'loops'))) {
    if (!f.isFile() || !/\.(mp4|webm)$/i.test(f.name)) continue;
    const base = f.name.replace(/\.(mp4|webm)$/i, '');
    const hd = base.endsWith('-hd');
    const slug = hd ? base.slice(0, -3) : base;
    loops[slug] = loops[slug] || {};
    loops[slug][hd ? 'hd' : 'sd'] = url('loops', f.name);
  }

  // ---- self-hosted films ---------------------------------------------------
  const films = {};
  for (const f of list(path.join(mediaDir, 'films'))) {
    if (!f.isFile() || !/\.(mp4|webm)$/i.test(f.name)) continue;
    const slug = f.name.replace(/\.(mp4|webm)$/i, '');
    const file = path.join(mediaDir, 'films', f.name);
    const info = mp4Info(file) || {};
    films[slug] = {
      src: url('films', f.name),
      duration: info.duration || 0,
      width: info.width || 0,
      height: info.height || 0,
      bytes: fs.statSync(file).size,
    };
  }

  // ---- posters -------------------------------------------------------------
  const posters = {};
  for (const f of list(path.join(mediaDir, 'posters'))) {
    if (!f.isFile() || !IMAGE_EXT.test(f.name)) continue;
    const slug = f.name.replace(IMAGE_EXT, '');
    const size = imageSize(path.join(mediaDir, 'posters', f.name)) || {};
    // prefer .webp if both exist
    if (posters[slug] && !/\.webp$/i.test(f.name)) continue;
    posters[slug] = { src: url('posters', f.name), width: size.width || 0, height: size.height || 0 };
  }
  // Small copies used in lists and on the work wall (made by tools/media.js).
  for (const f of list(path.join(mediaDir, 'posters', 'thumbs'))) {
    if (!f.isFile() || !IMAGE_EXT.test(f.name)) continue;
    const slug = f.name.replace(IMAGE_EXT, '');
    if (posters[slug]) posters[slug].thumb = url('posters', 'thumbs', f.name);
  }

  // ---- photos --------------------------------------------------------------
  const photos = [];
  const photoRoot = path.join(mediaDir, 'photos');
  for (const dir of list(photoRoot)) {
    if (!dir.isDirectory()) continue;
    photos.push(...scanImageFolder(path.join(photoRoot, dir.name), (name) => url('photos', dir.name, name))
      .map((p) => ({ ...p, category: dir.name, id: `${dir.name}/${p.name}` })));
  }

  // ---- about ---------------------------------------------------------------
  const about = {};
  for (const img of scanImageFolder(path.join(mediaDir, 'about'), (name) => url('about', name))) {
    about[img.name] = img;
  }

  return { loops, films, posters, photos, about };
}

/**
 * Groups "name.jpg", "name-800.webp", "name-1600.webp" into one image with a
 * srcset. Returns [{ name, src, width, height, sources: [{ src, width }] }]
 * sorted by file name (so "01-", "02-" prefixes control the order).
 */
function scanImageFolder(dir, toUrl) {
  const groups = new Map();
  for (const f of list(dir)) {
    if (!f.isFile() || !IMAGE_EXT.test(f.name)) continue;
    const base = f.name.replace(IMAGE_EXT, '');
    const sized = base.match(SIZED);
    const name = sized ? sized[1] : base;
    const size = imageSize(path.join(dir, f.name));
    if (!size) continue;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push({ src: toUrl(f.name), width: size.width, height: size.height, webp: /\.webp$/i.test(f.name) });
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    .map(([name, files]) => {
      // If web-sized .webp copies exist, use only those. Otherwise use whatever is there.
      const webp = files.filter((f) => f.webp);
      const sources = (webp.length ? webp : files).sort((a, b) => a.width - b.width);
      const largest = sources[sources.length - 1];
      // default src: the ~1600px one if present, else the largest
      const fallback = sources.find((s) => s.width >= 1200) || largest;
      return { name, src: fallback.src, width: largest.width, height: largest.height, sources };
    });
}
