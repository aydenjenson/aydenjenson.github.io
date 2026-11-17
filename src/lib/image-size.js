// Read the pixel size of an image file without any dependencies.
// Supports JPEG, PNG, WebP and GIF. Returns { width, height } or null.
import fs from 'node:fs';

export function imageSize(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const head = Buffer.alloc(32);
    fs.readSync(fd, head, 0, 32, 0);

    // PNG
    if (head.toString('ascii', 1, 4) === 'PNG') {
      return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
    }
    // GIF
    if (head.toString('ascii', 0, 3) === 'GIF') {
      return { width: head.readUInt16LE(6), height: head.readUInt16LE(8) };
    }
    // WebP
    if (head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WEBP') {
      const kind = head.toString('ascii', 12, 16);
      if (kind === 'VP8 ') {
        return { width: head.readUInt16LE(26) & 0x3fff, height: head.readUInt16LE(28) & 0x3fff };
      }
      if (kind === 'VP8L') {
        const b = head.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
      if (kind === 'VP8X') {
        return { width: head.readUIntLE(24, 3) + 1, height: head.readUIntLE(27, 3) + 1 };
      }
      return null;
    }
    // JPEG: walk the segments until a Start-Of-Frame marker.
    if (head[0] === 0xff && head[1] === 0xd8) {
      const size = fs.fstatSync(fd).size;
      const buf = Buffer.alloc(Math.min(size, 1024 * 1024));
      fs.readSync(fd, buf, 0, buf.length, 0);
      let off = 2;
      let orientation = 1;
      while (off + 9 < buf.length) {
        if (buf[off] !== 0xff) { off += 1; continue; }
        const marker = buf[off + 1];
        if (marker === 0xff) { off += 1; continue; }
        const len = buf.readUInt16BE(off + 2);
        // EXIF orientation (so portrait phone shots report the right way up)
        if (marker === 0xe1 && buf.toString('ascii', off + 4, off + 8) === 'Exif') {
          orientation = exifOrientation(buf, off + 10) || orientation;
        }
        const isSOF = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
        if (isSOF) {
          const height = buf.readUInt16BE(off + 5);
          const width = buf.readUInt16BE(off + 7);
          return orientation >= 5 ? { width: height, height: width } : { width, height };
        }
        off += 2 + len;
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function exifOrientation(buf, tiff) {
  try {
    const little = buf.toString('ascii', tiff, tiff + 2) === 'II';
    const u16 = (o) => (little ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
    const u32 = (o) => (little ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
    const ifd = tiff + u32(tiff + 4);
    const count = u16(ifd);
    for (let i = 0; i < count; i += 1) {
      const entry = ifd + 2 + i * 12;
      if (u16(entry) === 0x0112) return u16(entry + 8);
    }
  } catch { /* ignore */ }
  return 0;
}
