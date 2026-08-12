/**
 * Inlines the self-hosted fonts and the hero portrait into the design-direction
 * document so it can be published as a single self-contained page.
 *
 * The published artifact runs under a strict CSP that blocks every external
 * host, so nothing may be referenced by URL — fonts and images have to travel
 * as data URIs inside the file itself.
 *
 * Usage: node scripts/build-design-doc.mjs
 */

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'info/direccion-diseno.html');
const out = resolve(root, 'info/direccion-diseno.build.html');

const assets = {
  __FONT_EBG_400__: ['public/fonts/ebgaramond-400.woff2', 'font/woff2'],
  __FONT_EBG_400I__: ['public/fonts/ebgaramond-400-italic.woff2', 'font/woff2'],
  __FONT_EBG_600__: ['public/fonts/ebgaramond-600.woff2', 'font/woff2'],
  __FONT_AS_400__: ['public/fonts/alegreyasans-400.woff2', 'font/woff2'],
  __FONT_AS_500__: ['public/fonts/alegreyasans-500.woff2', 'font/woff2'],
  __FONT_AS_700__: ['public/fonts/alegreyasans-700.woff2', 'font/woff2'],
  __PHOTO_VIRGINIA__: ['info/virginia.jpeg', 'image/jpeg'],
};

let html = readFileSync(src, 'utf8');

for (const [token, [path, mime]] of Object.entries(assets)) {
  const file = resolve(root, path);
  const bytes = readFileSync(file);
  html = html.replaceAll(token, `data:${mime};base64,${bytes.toString('base64')}`);
  console.log(`${path.padEnd(38)} ${(statSync(file).size / 1024).toFixed(1)} KB`);
}

const leftover = html.match(/__[A-Z0-9_]+__/g);
if (leftover) throw new Error(`Unsubstituted tokens: ${[...new Set(leftover)].join(', ')}`);

writeFileSync(out, html);
console.log(`\nwrote info/direccion-diseno.build.html  ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
