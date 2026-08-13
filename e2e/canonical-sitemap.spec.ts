import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ALL_ROUTES } from './routes.fixture';

// design.md risk E: "Canonical URL rule is expressed twice (TS + .mjs
// sitemap). Mitigation: Playwright asserts each page's canonical equals its
// sitemap entry — drift fails the verify gate." (task 8.5)
//
// Reads the REAL built sitemap.xml (scripts/generate-sitemap.mjs's actual
// output from this batch's `npm run build`) and the REAL rendered
// <link rel="canonical"> for each route — no hardcoded expected URL on
// either side, so a regression in either implementation fails this test.
//
// Originally / + /contacto only; extended to all 15 prerendered routes
// (task 9.1) — this is the E2E half of design risk E's mitigation for the
// ten routes added by `content`, closing it the same way `foundation`
// closed it for the first two.

const ROUTES = ALL_ROUTES.map((route) => route.path);

function extractLocs(sitemapXml: string): string[] {
  return Array.from(sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
}

test('each prerendered route\'s <link rel="canonical"> href exactly matches its sitemap.xml entry', async ({
  page,
}) => {
  const sitemapPath = join(process.cwd(), 'dist', 'pureza', 'browser', 'sitemap.xml');
  const sitemapXml = await readFile(sitemapPath, 'utf-8');
  const sitemapLocs = extractLocs(sitemapXml);
  expect(sitemapLocs.length).toBeGreaterThan(0);

  for (const route of ROUTES) {
    await page.goto(route);
    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonicalHref, `no canonical link found for ${route}`).toBeTruthy();
    expect(sitemapLocs, `sitemap.xml has no <loc> matching ${route}'s canonical`).toContain(
      canonicalHref,
    );
  }
});
