// Read duration and frame size from an .mp4 / .mov file without ffmpeg.
// Returns { duration (seconds), width, height } or null if it can't be read.
import fs from 'node:fs';

export function mp4Info(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const size = fs.fstatSync(fd).size;
    const head = Buffer.alloc(16);
    let pos = 0;
    while (pos + 8 <= size) {
      fs.readSync(fd, head, 0, 16, pos);
      let boxSize = head.readUInt32BE(0);
      const type = head.toString('latin1', 4, 8);
      let headerLen = 8;
      if (boxSize === 1) { boxSize = Number(head.readBigUInt64BE(8)); headerLen = 16; }
      else if (boxSize === 0) { boxSize = size - pos; }
      if (type === 'moov') {
        const buf = Buffer.alloc(Math.min(boxSize - headerLen, 16 * 1024 * 1024));
        fs.readSync(fd, buf, 0, buf.length, pos + headerLen);
        return parseMoov(buf);
      }
      if (boxSize < 8) break;
      pos += boxSize;
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function* boxes(buf) {
  let pos = 0;
  while (pos + 8 <= buf.length) {
    const size = buf.readUInt32BE(pos);
    const type = buf.toString('latin1', pos + 4, pos + 8);
    if (size < 8 || pos + size > buf.length) return;
    yield { type, data: buf.subarray(pos + 8, pos + size) };
    pos += size;
  }
}

function parseMoov(moov) {
  const out = { duration: 0, width: 0, height: 0 };
  for (const box of boxes(moov)) {
    if (box.type === 'mvhd') {
      const d = box.data;
      const v1 = d[0] === 1;
      const timescale = v1 ? d.readUInt32BE(20) : d.readUInt32BE(12);
      const duration = v1 ? Number(d.readBigUInt64BE(24)) : d.readUInt32BE(16);
      if (timescale) out.duration = duration / timescale;
    }
    if (box.type === 'trak' && !out.width) {
      for (const inner of boxes(box.data)) {
        if (inner.type !== 'tkhd') continue;
        const d = inner.data;
        const base = d[0] === 1 ? 52 : 40; // start of the 3x3 matrix
        const a = d.readInt32BE(base);
        const dd = d.readInt32BE(base + 16);
        let w = d.readUInt32BE(base + 36) / 65536;
        let h = d.readUInt32BE(base + 40) / 65536;
        if (a === 0 && dd === 0) [w, h] = [h, w]; // rotated 90 degrees
        if (w && h) { out.width = Math.round(w); out.height = Math.round(h); }
      }
    }
  }
  return out.duration || out.width ? out : null;
}
