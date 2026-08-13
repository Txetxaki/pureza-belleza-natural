import { expect, test } from '@playwright/test';

// task 8.4: one desktop + one mobile viewport snapshot per route. Explicit
// viewport sizes (not two Playwright "projects") so this is the ONLY spec
// that runs twice per route — the rest of the e2e suite runs once against
// the default desktop project.
//
// Slice 9 (task 9.1) extends this beyond the original / + /contacto pair.
// Full 15-route × 2-viewport coverage would be 30 baselines to generate and
// maintain per visual change — unwieldy for the marginal signal over the
// axe/canonical/zero-external-request checks every route already gets in
// `accessibility.spec.ts` / `canonical-sitemap.spec.ts`. Chosen instead,
// pragmatically: the five service pages (one full pass through
// `pz-service-page`'s nine-part anatomy, one per plant accent so a
// regression in any accent's tokens/contrast shows up visually), `/precios`
// (the five-sibling-scope layout — the one page structurally unlike any
// other), `/reservar` (the newest conversion-focused layout), `/diario` (the
// index/listing layout), and one representative article (the
// `NgComponentOutlet`-rendered post-body layout — the other two articles
// share the same shell and typography, so a second/third snapshot would
// mostly re-prove the same rendering path). `/virginia` and `/el-salon`
// reuse layout patterns already covered elsewhere (prose page, no distinct
// new layout) and are intentionally left out to keep this list reviewable.
const ROUTES: ReadonlyArray<{ readonly path: string; readonly name: string }> = [
  { path: '/', name: 'home' },
  { path: '/contacto', name: 'contacto' },
  { path: '/coloracion-vegetal-aveda', name: 'coloracion-vegetal-aveda' },
  { path: '/mechas-babylights-balayage', name: 'mechas-babylights-balayage' },
  { path: '/rastas', name: 'rastas' },
  { path: '/extensiones-cabello-natural', name: 'extensiones-cabello-natural' },
  { path: '/tratamientos-capilares', name: 'tratamientos-capilares' },
  { path: '/precios', name: 'precios' },
  { path: '/reservar', name: 'reservar' },
  { path: '/diario', name: 'diario' },
  { path: '/diario/cuanto-dura-coloracion-sin-amoniaco', name: 'diario-articulo' },
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
