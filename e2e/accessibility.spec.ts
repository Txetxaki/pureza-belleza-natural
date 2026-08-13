import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ALL_ROUTES } from './routes.fixture';

// design.md "Testing strategy": axe-core AA + zero external network requests
// (self-hosted fonts, click-to-load map) on every prerendered route.
// Originally / + /contacto only (task 8.3); extended to all 15 routes (task
// 9.1) once the ten remaining routes shipped — the site scores 100/100
// Lighthouse accessibility and passes axe AA on the two original routes, and
// this loop is the hard gate that keeps it that way for every new page.
const ROUTES = ALL_ROUTES.map((route) => route.path);

// Substring match on request URLs — design.md §2 forbids Google/Adobe Fonts
// CDNs entirely (self-hosted from public/fonts); design.md §7/task 6.4/7.5
// forbids an EAGER Google Maps request (the embed only loads on click).
const FORBIDDEN_HOST_SUBSTRINGS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'google.com/maps',
  'maps.googleapis.com',
];

for (const route of ROUTES) {
  test(`${route} — passes an axe-core WCAG 2.2 AA scan`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test(`${route} — makes zero requests to a font CDN or an eager Maps domain during page load`, async ({
    page,
  }) => {
    const externalRequestUrls: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (!url.startsWith('http://localhost')) {
        externalRequestUrls.push(url);
      }
    });

    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const forbidden = externalRequestUrls.filter((url) =>
      FORBIDDEN_HOST_SUBSTRINGS.some((host) => url.includes(host)),
    );
    expect(forbidden, `forbidden requests seen: ${JSON.stringify(forbidden)}`).toEqual([]);
  });
}
