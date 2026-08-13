import { expect, test } from '@playwright/test';
import {
  CARTA_LINKS,
  CARTA_TRIGGER,
  DIARIO_LINKS,
  DIARIO_TRIGGER,
  waitForHydration,
} from './test-helpers';

// tasks.md Slice 9, task 9.1: "Header-specific: dropdown reachable and
// operable keyboard-only (Tab to trigger, Enter opens, ArrowDown/Tab moves
// through links, Escape closes and returns focus)." design.md "Header
// dropdown (accessible, degrades without JS)" section; app-shell spec
// "Dropdown links to five service routes, no index page" — this is the
// real-browser, keyboard-only confirmation of that end state, deferred from
// Slice 3 until all five service routes were live (tasks.md Slice 9 intro).

test.describe('header Carta dropdown — keyboard only', () => {
  test('Enter toggles the trigger open, listing exactly the five live service routes', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const trigger = page.locator(CARTA_TRIGGER);
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await expect(page.locator(CARTA_LINKS)).toHaveCount(5);
  });

  test('ArrowDown on the trigger opens the panel and moves focus to its first link', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const trigger = page.locator(CARTA_TRIGGER);
    await trigger.focus();

    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await expect(page.locator(CARTA_LINKS).first()).toBeFocused();
  });

  test('Tab moves focus through the panel links while open, and Escape closes the panel and returns focus to the trigger', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const trigger = page.locator(CARTA_TRIGGER);
    await trigger.focus();
    await page.keyboard.press('ArrowDown');

    const links = page.locator(CARTA_LINKS);
    await expect(links.first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(links.nth(1)).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });
});

// Feedback round. These three properties are only observable in a real
// browser: they all depend on a client-side router navigation happening
// without a document reload, which is exactly what a unit test cannot stage.
test.describe('header disclosures — after navigating', () => {
  test('the panel closes over the page it just navigated to', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const trigger = page.locator(CARTA_TRIGGER);

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.locator(CARTA_LINKS).first().click();
    await expect(page).toHaveURL(/\/coloracion-vegetal-aveda$/);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('the parent trigger reads as active while one of its children is open', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const cartaTrigger = page.locator(CARTA_TRIGGER);

    await expect(cartaTrigger).not.toHaveClass(/is-active/);

    await cartaTrigger.click();
    await page.locator(CARTA_LINKS).first().click();

    await expect(cartaTrigger).toHaveClass(/is-active/);
  });

  test('an article marks its Diario parent active, and the panel lists the index plus every article', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const diarioTrigger = page.locator(DIARIO_TRIGGER);

    await diarioTrigger.click();
    // The index link heads the panel, then one link per launch article.
    await expect(page.locator(DIARIO_LINKS)).toHaveCount(4);

    await page.locator(DIARIO_LINKS).nth(1).click();
    await expect(page).toHaveURL(/\/diario\/[a-z0-9-]+$/);
    await expect(diarioTrigger).toHaveClass(/is-active/);
    await expect(diarioTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('a navigation lands at the top of the page, not at the previous scroll offset', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);

    await page.locator(CARTA_TRIGGER).click();
    await page.locator(CARTA_LINKS).first().click();
    await expect(page).toHaveURL(/\/coloracion-vegetal-aveda$/);

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
});
