import { expect, test } from '@playwright/test';
import { ALL_ROUTES } from './routes.fixture';

// The guard for the defect this suite exists to prevent: a page that scrolls
// sideways on a phone.
//
// It shipped exactly that way. `site-header.scss` carried
// "Below 720px: static expanded list, no hamburger (out of scope this slice)",
// which force-revealed both dropdown panels inline and left the desktop nav in
// the flow. The nav measured 679px inside a 360px viewport, so EVERY route had
// a document 940px wide: the wordmark sat off-screen, the two panels covered
// the top of the page, and every horizontal swipe dragged the whole layout.
//
// 320px is the narrowest viewport still worth supporting (iPhone SE 1st gen /
// Galaxy Fold cover screen) and is where a fixed-width regression shows up
// first; 390px is the modern iPhone default and the width most visitors will
// actually use.
const MOBILE_WIDTHS = [320, 390] as const;

// One pixel of tolerance: sub-pixel layout rounding can leave scrollWidth a
// hair over clientWidth on a perfectly fine page, and failing on that would
// make this spec flaky rather than useful.
const TOLERANCE_PX = 1;

for (const width of MOBILE_WIDTHS) {
  for (const route of ALL_ROUTES) {
    test(`${route.name} does not scroll horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route.path);

      const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        // Naming the widest offenders turns a bare "941 > 390" into an
        // actionable failure — the element that actually blew the layout.
        const offenders = [...document.querySelectorAll('body *')]
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.width > 0 && rect.right > viewportWidth + 1)
          .sort((a, b) => b.rect.right - a.rect.right)
          .slice(0, 3)
          .map(({ element, rect }) => {
            const classAttribute = element.getAttribute('class') ?? '';
            return `${element.tagName.toLowerCase()}.${classAttribute.split(' ')[0]} (right: ${Math.round(rect.right)}px)`;
          });

        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: viewportWidth,
          offenders,
        };
      });

      expect(
        scrollWidth,
        offenders.length > 0 ? `widest overflowing elements: ${offenders.join(', ')}` : undefined,
      ).toBeLessThanOrEqual(clientWidth + TOLERANCE_PX);
    });
  }
}

test.describe('mobile header drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('replaces the inline nav with a burger that meets the 44px target floor', async ({
    page,
  }) => {
    await page.goto('/rastas');

    const burger = page.locator('.site-header__burger');
    await expect(burger).toBeVisible();
    await expect(page.locator('#site-nav')).toBeHidden();

    // WCAG 2.2 AA 2.5.8 Target Size (Minimum). The bars inside are 2px tall,
    // so the button's box has to be sized on purpose or it collapses to them.
    const box = await burger.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('opens on click, exposes every nav link, and still does not overflow', async ({ page }) => {
    await page.goto('/rastas');

    const burger = page.locator('.site-header__burger');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');

    const drawer = page.locator('#site-nav');
    await expect(drawer).toBeVisible();

    // Five services + the diario index + three articles + the non-service
    // links. The exact figure is asserted loosely on purpose: the header is
    // registry-driven and flipping a route live must not fail this spec.
    expect(await drawer.locator('a:visible').count()).toBeGreaterThanOrEqual(10);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390 + TOLERANCE_PX);
  });

  test('closes itself when a link inside it navigates', async ({ page }) => {
    // Routing is a same-document navigation: nothing reloads and focus stays
    // inside the drawer, so if the header does not close itself it stays open
    // on top of the page it just navigated to.
    await page.goto('/rastas');
    await page.locator('.site-header__burger').click();
    await page.locator('#site-nav a', { hasText: 'Mechas de Autor' }).first().click();

    await expect(page).toHaveURL(/\/mechas-babylights-balayage$/);
    await expect(page.locator('#site-nav')).toBeHidden();
    await expect(page.locator('.site-header__burger')).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes on Escape and returns focus to the burger', async ({ page }) => {
    // The first attempt paired `.is-open` with a `:focus-within` fallback so
    // the drawer would work without JS. It made this impossible: closing
    // leaves focus on the burger, which is inside the same zone, so the CSS
    // instantly re-revealed what the signal had just shut — `aria-expanded`
    // read "false" over a visibly open drawer.
    await page.goto('/rastas');
    const burger = page.locator('.site-header__burger');
    await burger.click();
    await expect(page.locator('#site-nav')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.locator('#site-nav')).toBeHidden();
    await expect(burger).toBeFocused();
  });
});
