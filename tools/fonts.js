#!/usr/bin/env node
// Fetches the one font that may not be kept in this repository.
//
//   node tools/fonts.js           make sure the font file is in place (download it if not)
//   node tools/fonts.js --force   download it again even if it is there
//
// WHY THIS EXISTS
// The headings are set in Gambarino (Ayden's pick, 2026-11-18). Gambarino is
// published by Indian Type Foundry on Fontshare under the ITF Free Font
// License. That license lets Ayden host the font on his own website, free,
// for business use. It does not let the font file be passed on through a
// public repository, and this repository is public. So the file is not
// committed (see .gitignore). Instead:
//   - on this PC it sits in src/assets/fonts/ like any other font, for the preview;
//   - when the site is published, the GitHub workflow runs this script first,
//     which downloads the font straight from Fontshare, and `node build.js`
//     then copies it into the site, where visitors' browsers get it from
//     aydenjenson.com like every other file.
// The license also forbids changing the file in any way (no subsetting, no
// format conversion, no renaming inside the font), so it is used exactly as
// it comes out of Fontshare's own package, under its own file name.
// License text: https://www.fontshare.com/licenses/itf-ffl
//
// No dependencies: the zip is read with a few lines of code below.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = path.join(ROOT, 'src', 'assets', 'fonts');

export const FETCHED_FONTS = [
  {
    name: 'Gambarino',
    file: 'Gambarino-Regular.woff2',
    // The package Fontshare offers on https://www.fontshare.com/fonts/gambarino ("Download family")
    packageUrl: 'https://api.fontshare.com/v2/fonts/download/gambarino',
    entry: 'Fonts/WEB/fonts/Gambarino-Regular.woff2',
    // What the file was on 2026-11-18. If Fontshare publishes a newer version the
    // script still uses it, and says so, because the look may shift slightly.
    size: 17104,
    sha256: '42b9b1445555af9a47ff748332a0da9c7526fc6ecf403c620916640490b4765b',
  },
];

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

/** Pull one file out of a zip held in memory. `wanted` is matched at the end of the entry's path. */
function unzipOne(zip, wanted) {
  // The "end of central directory" record is at the very end (before an optional comment).
  let end = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i -= 1) {
    if (zip.readUInt32LE(i) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error('the download is not a zip file');
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  for (let n = 0; n < count; n += 1) {
    if (zip.readUInt32LE(at) !== 0x02014b50) throw new Error('the zip file is damaged');
    const method = zip.readUInt16LE(at + 10);
    const packed = zip.readUInt32LE(at + 20);
    const unpacked = zip.readUInt32LE(at + 24);
    const nameLen = zip.readUInt16LE(at + 28);
    const extraLen = zip.readUInt16LE(at + 30);
    const commentLen = zip.readUInt16LE(at + 32);
    const local = zip.readUInt32LE(at + 42);
    const name = zip.toString('utf8', at + 46, at + 46 + nameLen);
    if (name.endsWith(wanted)) {
      if (zip.readUInt32LE(local) !== 0x04034b50) throw new Error('the zip file is damaged');
      const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const data = zip.subarray(start, start + packed);
      const out = method === 0 ? Buffer.from(data) : method === 8 ? zlib.inflateRawSync(data) : null;
      if (!out) throw new Error(`the zip uses a compression this script does not read (method ${method})`);
      if (out.length !== unpacked) throw new Error('the file did not unpack to its stated size');
      return out;
    }
    at += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`"${wanted}" is not in the package any more`);
}

async function fetchFont(font) {
  const res = await fetch(font.packageUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Fontshare answered ${res.status} ${res.statusText}`);
  const zip = Buffer.from(await res.arrayBuffer());
  const data = unzipOne(zip, font.entry);
  if (data.toString('latin1', 0, 4) !== 'wOF2') throw new Error('the file in the package is not a WOFF2 font');
  return data;
}

async function main() {
  const force = process.argv.includes('--force');
  let failed = false;
  fs.mkdirSync(FONT_DIR, { recursive: true });
  for (const font of FETCHED_FONTS) {
    const dest = path.join(FONT_DIR, font.file);
    try {
      if (!force && fs.existsSync(dest)) {
        const same = sha256(fs.readFileSync(dest)) === font.sha256;
        console.log(`${font.name}: already here${same ? '' : ' (a different version from the one recorded in tools/fonts.js)'}.`);
        continue;
      }
      const data = await fetchFont(font);
      fs.writeFileSync(dest, data);
      const same = sha256(data) === font.sha256;
      console.log(`${font.name}: downloaded from Fontshare, ${(data.length / 1024).toFixed(1)} KB.`);
      if (!same) {
        console.log(`  note: Fontshare has published a different version of ${font.file} (${data.length} bytes; ${font.size} expected).`);
        console.log('  It is used as it is. Look at the headings in the preview, then record the new size and sha256 in tools/fonts.js.');
      }
    } catch (err) {
      failed = true;
      console.error(`\n${font.name} could not be fetched: ${err.message}`);
      console.error(`The site needs src/assets/fonts/${font.file} to be built. Nothing was published.`);
      console.error(`Try again in a little while. The font comes from ${font.packageUrl}\n`);
    }
  }
  if (failed) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
