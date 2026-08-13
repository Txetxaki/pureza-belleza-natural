import { expect, test } from '@playwright/test';
import { SERVICE_ROUTES } from './routes.fixture';

// design.md D2 / service-pages spec "Single accent scope per page". The rule
// the design actually states is "never nested, one accent per service route" —
// NOT "exactly one element carries the attribute". This test used to assert
// the count, which was an accurate proxy only while every service route
// happened to render a single scoped element; the Aveda credential block on
// /coloracion-vegetal-aveda is a legitimate SIBLING scope of the same plant,
// exactly like the five siblings on the home carta and on /precios.
//
// So the two properties asserted here are the real ones: every scope on the
// route names that route's registry planta, and no scope is nested inside
// another. Both would still catch the failure the count was standing in for —
// a second, different accent bleeding onto the page.
for (const route of SERVICE_ROUTES) {
  test(`${route.path} — every [data-planta] scope is its registry planta, and none is nested`, async ({
    page,
  }) => {
    await page.goto(route.path);

    const scopes = page.locator('[data-planta]');
    await expect(scopes.first()).toBeAttached();

    const plantas = await scopes.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-planta')),
    );
    expect(new Set(plantas)).toEqual(new Set([route.planta]));

    const nested = await page.locator('[data-planta] [data-planta]').count();
    expect(nested).toBe(0);
  });
}

// design-system spec, "/precios sibling exception holds" (design.md's
// correction: "never nested, one accent per service route" — /precios and
// the home carta/frieze are both legitimate five-sibling pages). This is the
// end-state-only assertion deferred from earlier slices, now provable
// against the real built page (tasks.md Slice 9 intro).
test('/precios — renders five sibling [data-planta] scopes, none nested inside another', async ({
  page,
}) => {
  await page.goto('/precios');

  const scopes = page.locator('[data-planta]');
  await expect(scopes).toHaveCount(5);

  const plantas = await scopes.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-planta')),
  );
  expect(new Set(plantas).size).toBe(5);

  const nestedCount = await scopes.evaluateAll(
    (nodes) =>
      nodes.filter((node) => node.parentElement?.closest('[data-planta]') != null).length,
  );
  expect(nestedCount).toBe(0);
});
