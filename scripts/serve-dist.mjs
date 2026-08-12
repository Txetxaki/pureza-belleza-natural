#!/usr/bin/env node
// Minimal static file server for `dist/pureza/browser` — used only by
// Playwright's `webServer` (playwright.config.ts) to serve the REAL
// prerendered build (design.md testing strategy: "E2E ... Playwright over
// the prerendered dist"), not the SSR Express server (src/server.ts), which
// exists for a future dynamic route (`/reservar/**`) this change doesn't
// ship yet. No third-party dependency — a route like `/contacto` needs only
// "map the path to its `index.html`", which `node:http` + `node:fs` already
// do in a dozen lines.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROOT = join(process.cwd(), 'dist', 'pureza', 'browser');
const PORT = Number(process.env.PORT) || 4310;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

/** `/contacto` → `<ROOT>/contacto/index.html`; `/` → `<ROOT>/index.html`. */
async function resolveFile(pathname) {
  const direct = join(ROOT, pathname);
  try {
    const stats = await stat(direct);
    return stats.isDirectory() ? join(direct, 'index.html') : direct;
  } catch {
    return join(ROOT, pathname, 'index.html');
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  resolveFile(decodeURIComponent(url.pathname))
    .then((filePath) => readFile(filePath).then((data) => ({ filePath, data })))
    .then(({ filePath, data }) => {
      res.setHeader('Content-Type', MIME_TYPES[extname(filePath)] ?? 'application/octet-stream');
      res.end(data);
    })
    .catch(() => {
      res.statusCode = 404;
      res.end('Not found');
    });
});

server.listen(PORT, () => {
  console.log(`[serve-dist] serving ${ROOT} on http://localhost:${PORT}`);
});
