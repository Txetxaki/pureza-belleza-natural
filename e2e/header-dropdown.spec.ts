import { expect, test } from '@playwright/test';
import { waitForHydration } from './test-helpers';

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
    const trigger = page.locator('.header-carta__trigger');
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const links = page.locator('.header-carta__panel .header-carta__link');
    await expect(links).toHaveCount(5);
  });

  test('ArrowDown on the trigger opens the panel and moves focus to its first link', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const trigger = page.locator('.header-carta__trigger');
    await trigger.focus();

    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const firstLink = page.locator('.header-carta__panel .header-carta__link').first();
    await expect(firstLink).toBeFocused();
  });

  test('Tab moves focus through the panel links while open, and Escape closes the panel and returns focus to the trigger', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const trigger = page.locator('.header-carta__trigger');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');

    const links = page.locator('.header-carta__panel .header-carta__link');
    await expect(links.first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(links.nth(1)).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });
});
