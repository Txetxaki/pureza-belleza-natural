import { expect, test } from '@playwright/test';
import { SERVICE_ROUTES } from './routes.fixture';

// tasks.md Slice 9, task 9.1: "Service-page-specific: exactly one
// [data-planta] per page." design.md D2 / service-pages spec "Single accent
// scope per page" — already guaranteed at construction by `pz-service-page`
// binding `host: { '[attr.data-planta]': planta() }` and unit-tested at the
// component level (`pz-service-page.spec.ts`); this is the real-browser,
// real-route confirmation against the actual prerendered HTML.
for (const route of SERVICE_ROUTES) {
  test(`${route.path} — renders exactly one [data-planta] scope, matching its registry planta`, async ({
    page,
  }) => {
    await page.goto(route.path);
    const scopes = page.locator('[data-planta]');
    await expect(scopes).toHaveCount(1);
    await expect(scopes).toHaveAttribute('data-planta', route.planta);
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
