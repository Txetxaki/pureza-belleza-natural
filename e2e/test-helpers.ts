import { expect, type Page } from '@playwright/test';

/**
 * This app hydrates client-side on top of prerendered HTML with no
 * `withEventReplay()` configured — a keyboard/mouse event dispatched before
 * hydration completes is simply missed: the DOM element exists and accepts
 * native browser default actions, but no Angular event listener is attached
 * yet to run any application logic. Confirmed by direct investigation while
 * writing `header-dropdown.spec.ts` (Slice 9, task 9.1): the ArrowDown
 * handler is fully deterministic once the app is hydrated, but flaky when
 * exercised immediately after `page.goto` — `page.waitForLoadState`
 * ('networkidle') does NOT reliably cover this window either, since no
 * further network activity is required for hydration/change-detection to
 * finish. This is a test-timing concern, not an application bug (the fix
 * belongs in the test, not the app — see apply-progress for the investigation
 * trail).
 *
 * Clicking the header's `Carta` trigger and asserting its own
 * `aria-expanded` binding responds is a cheap, real, page-agnostic signal
 * that hydration is live (the trigger renders identically on every route —
 * app-shell spec "Every route renders through the shell"); resets state
 * afterwards so the calling test starts clean. Any e2e spec that simulates a
 * keyboard- or mouse-driven Angular interaction right after `page.goto`
 * should call this first.
 */
export async function waitForHydration(page: Page): Promise<void> {
  const trigger = page.locator('.header-carta__trigger');
  await expect(async () => {
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  }).toPass({ timeout: 10_000, intervals: [50, 100, 200, 400] });
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
}
