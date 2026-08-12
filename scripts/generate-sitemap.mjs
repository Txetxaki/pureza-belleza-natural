#!/usr/bin/env node
// postbuild — walks the prerendered build output and emits `sitemap.xml` into
// the same directory (design.md §5, seo-infrastructure spec "Postbuild
// sitemap generation"). Never hand-maintained: this script is the only writer
// of `dist/pureza/browser/sitemap.xml`.
//
// `lastmod` is deliberately omitted — a build-time date would be false for a
// page whose content didn't actually change, and an unreliable `lastmod` is a
// negative signal to crawlers (design.md §5).
//
// SITE_URL below duplicates `SITE.url` from `src/app/seo/domain/site.ts`
// deliberately: a plain `.mjs` script cannot import project TypeScript at
// build time (same accepted pattern as `generate-image-variants.mjs`'s
// filename-convention duplication). `pathToUrl` here and `canonicalUrl` in
// `seo/domain/route-seo.ts` implement the SAME join rule (design.md risk E) —
// keep both in sync if the domain ever changes; a future Playwright check
// (PR5) asserts each prerendered page's `<link rel="canonical">` equals its
// sitemap entry, so drift between the two fails that gate.
const SITE_URL = 'https://purezabellezanatural.es';

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `relativeDir` is a directory path relative to `dist/pureza/browser`
 * (e.g. `''` for the root `index.html`, `'contacto'` for `contacto/index.html`).
 * Returns the full canonical URL for that route — the SAME join rule as
 * `seo/domain/route-seo.ts`'s `canonicalUrl` (design.md risk E).
 */
export function pathToUrl(relativeDir) {
  const normalized = relativeDir === '' || relativeDir === '.' ? '' : relativeDir.split(sep).join('/');
  return `${SITE_URL}${normalized === '' ? '/' : `/${normalized}`}`;
}

/** Recursively finds every `index.html` under `dir`, returned as route-relative paths. */
async function findPrerenderedRoutes(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let routes = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      routes = routes.concat(await findPrerenderedRoutes(fullPath, baseDir));
    } else if (entry.isFile() && entry.name === 'index.html') {
      const relativeDir = relative(baseDir, dir);
      routes.push(relativeDir === '' ? '' : relativeDir.split(sep).join('/'));
    }
  }
  return routes;
}

function buildSitemapXml(entries) {
  const items = entries
    .map(
      (entry) =>
        `  <url>\n    <loc>${entry.loc}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

async function main() {
  const browserDir = join(process.cwd(), 'dist', 'pureza', 'browser');
  const registryPath = join(process.cwd(), 'src', 'app', 'seo', 'route-seo.registry.json');

  const registry = JSON.parse(await readFile(registryPath, 'utf-8'));
  const registryByPath = new Map(registry.map((entry) => [entry.path, entry]));

  const builtRoutes = await findPrerenderedRoutes(browserDir);

  const liveRoutes = registry.filter((entry) => entry.status === 'live');
  const missingLive = liveRoutes.filter((entry) => !builtRoutes.includes(entry.path));
  if (missingLive.length > 0) {
    throw new Error(
      `[generate-sitemap] 'live' route(s) missing from prerendered output: ${missingLive
        .map((entry) => `"${entry.path}"`)
        .join(', ')} — check app.routes.server.ts`,
    );
  }

  const orphanBuiltRoutes = builtRoutes.filter((path) => !registryByPath.has(path));
  if (orphanBuiltRoutes.length > 0) {
    throw new Error(
      `[generate-sitemap] built path(s) with no route-seo.registry.json entry: ${orphanBuiltRoutes
        .map((path) => `"${path}"`)
        .join(', ')}`,
    );
  }

  const entries = builtRoutes.map((path) => {
    const registryEntry = registryByPath.get(path);
    return {
      loc: pathToUrl(path),
      changefreq: registryEntry.changefreq,
      priority: registryEntry.priority,
    };
  });

  const xml = buildSitemapXml(entries);
  await writeFile(join(browserDir, 'sitemap.xml'), xml, 'utf-8');
  console.log(`[generate-sitemap] wrote sitemap.xml with ${entries.length} URL(s)`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((error) => {
    console.error('[generate-sitemap] failed:', error.message);
    process.exitCode = 1;
  });
}
