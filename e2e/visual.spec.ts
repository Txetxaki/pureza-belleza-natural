import { expect, test } from '@playwright/test';

// task 8.4: one desktop + one mobile viewport snapshot per route (2 routes ×
// 2 viewports = 4 snapshots). Explicit viewport sizes (not two Playwright
// "projects") so this is the ONLY spec that runs twice per route — the rest
// of the e2e suite runs once against the default desktop project.
const ROUTES: ReadonlyArray<{ readonly path: string; readonly name: string }> = [
  { path: '/', name: 'home' },
  { path: '/contacto', name: 'contacto' },
];

const VIEWPORTS: ReadonlyArray<{ readonly name: string; readonly width: number; readonly height: number }> = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`visual snapshot — ${route.name} @ ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`${route.name}-${viewport.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
}
