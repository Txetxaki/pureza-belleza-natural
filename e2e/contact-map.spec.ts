import { expect, test } from '@playwright/test';

// contact-page spec "Click-to-load static map" (task 7.5).
//
// Task 4.8 (the committed static-map PNG) is still BLOCKED — no
// GOOGLE_MAPS_API_KEY was available (see
// src/app/shared/ui/pz-static-map/pz-static-map.ts's STATIC_MAP_ASSET_AVAILABLE
// = false). The REAL prerendered /contacto therefore renders the plain
// "Cómo llegar" text-link fallback, not the click-to-load button — this spec
// exercises exactly that live path in a real browser (not just the
// vitest/TestBed assumption in pz-static-map.spec.ts, which separately
// proves the button→iframe swap works once STATIC_MAP_ASSET_AVAILABLE flips
// to true and the asset lands).
test('/contacto shows no Maps iframe before interaction and degrades to the "Cómo llegar" fallback link', async ({
  page,
}) => {
  await page.goto('/contacto');

  await expect(page.locator('iframe')).toHaveCount(0);

  const fallback = page.locator('.pz-static-map__fallback');
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveText('Cómo llegar');
  await expect(fallback).toHaveAttribute('target', '_blank');
  await expect(fallback).toHaveAttribute('rel', 'noopener');

  const href = await fallback.getAttribute('href');
  expect(href).toContain('https://www.google.com/maps/search/?api=1&query=');

  // No click-to-load button exists while the static asset is blocked.
  await expect(page.locator('.pz-static-map__button')).toHaveCount(0);
});
