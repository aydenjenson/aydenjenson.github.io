#!/usr/bin/env node
// Local preview: `node dev.js` (or `npm run dev`), then open http://localhost:4321
// Rebuilds automatically when anything in content/, src/, media/ or public/
// changes, and refreshes the browser. No dependencies.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4321;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

const clients = new Set();
const RELOAD_SNIPPET = '<script>new EventSource("/__reload").onmessage = () => location.reload();</script>';

// Each rebuild runs build.js as a fresh process, so edits to the templates and
// to build.js itself are always picked up. Rebuilds never overlap: if a change
// arrives while one is running, one more runs right after it.
let building = false;
let queued = null;
function rebuild(reason) {
  if (building) { queued = reason || 'more changes'; return; }
  building = true;
  const child = spawn(process.execPath, [path.join(ROOT, 'build.js')], { cwd: ROOT });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  child.on('close', (code) => {
    building = false;
    const stamp = `[${new Date().toLocaleTimeString()}]`;
    if (code === 0) {
      console.log(`${stamp} ${output.trim().split('\n').pop()}${reason ? `  (${reason})` : ''}`);
      for (const res of clients) res.write('data: reload\n\n');
    } else {
      console.error(`${stamp} BUILD FAILED\n${output}`);
    }
    if (queued) { const next = queued; queued = null; rebuild(next); }
  });
}

function send404(res) {
  const file = path.join(DIST, '404.html');
  res.writeHead(404, { 'Content-Type': TYPES['.html'] });
  res.end(fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace('</body>', `${RELOAD_SNIPPET}</body>`) : 'Not found');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 800\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.join(DIST, rel);
  if (!file.startsWith(DIST)) return send404(res);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    res.writeHead(301, { Location: `${url.pathname}/` });
    return res.end();
  }
  if (!fs.existsSync(file)) return send404(res);

  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const stat = fs.statSync(file);
  const headers = { 'Content-Type': type, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };

  if (type.startsWith('text/html')) {
    const body = fs.readFileSync(file, 'utf8').replace('</body>', `${RELOAD_SNIPPET}</body>`);
    res.writeHead(200, headers);
    return res.end(body);
  }

  // Byte ranges, so video can seek (Safari will not play video without this).
  const range = req.headers.range && req.headers.range.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (start > end || start >= stat.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      return res.end();
    }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }

  res.writeHead(200, { ...headers, 'Content-Length': stat.size });
  fs.createReadStream(file).pipe(res);
});

rebuild('first build');

let timer;
const changed = (what) => {
  clearTimeout(timer);
  timer = setTimeout(() => rebuild(`${what} changed`), 250);
};
for (const dir of ['content', 'src', 'media', 'public']) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  fs.watch(full, { recursive: true }, (_event, name) => changed(`${dir}/${String(name || '').replace(/\\/g, '/')}`));
}
fs.watch(path.join(ROOT, 'build.js'), () => changed('build.js'));

server.listen(PORT, () => {
  console.log(`\n  Preview running at http://localhost:${PORT}\n  Press Ctrl+C to stop.\n`);
});
