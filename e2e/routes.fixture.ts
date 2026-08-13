// Single source of truth for "every prerendered route the Slice 9 e2e suite
// must cover" (tasks.md Slice 9, task 9.1 — "extend ROUTES arrays"). Kept as
// a literal list rather than an import of `route-seo.registry.json` /
// `posts.manifest.json`: every e2e spec here asserts against the REAL BUILT
// `dist/` output as a black box (same reasoning `canonical-sitemap.spec.ts`
// already uses reading `sitemap.xml` off disk instead of importing the
// registry) — the count is cross-checked independently and on the TypeScript
// side by `generate-sitemap.spec.ts`'s final-state 12+3=15 assertion (task
// 9.3), so a drift here would show up as a Playwright failure, not silently.
//
// 12 registry routes (all `status: 'live'`, confirmed in
// `src/app/seo/route-seo.registry.json`) + 3 `/diario/:slug` launch articles
// (`src/app/diario/posts.manifest.json`) = 15 total.

export interface RouteFixture {
  readonly path: string;
  readonly name: string;
}

/** The five plant-owned service routes and their registry `planta`. */
export const SERVICE_ROUTES: ReadonlyArray<RouteFixture & { readonly planta: string }> = [
  { path: '/coloracion-vegetal-aveda', name: 'coloracion-vegetal-aveda', planta: 'romero' },
  { path: '/mechas-babylights-balayage', name: 'mechas-babylights-balayage', planta: 'espliego' },
  { path: '/rastas', name: 'rastas', planta: 'esparto' },
  { path: '/extensiones-cabello-natural', name: 'extensiones-cabello-natural', planta: 'vid' },
  { path: '/tratamientos-capilares', name: 'tratamientos-capilares', planta: 'olivo' },
];

/** The seven non-service registry routes (home, salon pages, booking, blog index). */
export const OTHER_REGISTRY_ROUTES: readonly RouteFixture[] = [
  { path: '/', name: 'home' },
  { path: '/virginia', name: 'virginia' },
  { path: '/el-salon', name: 'el-salon' },
  { path: '/precios', name: 'precios' },
  { path: '/reservar', name: 'reservar' },
  { path: '/contacto', name: 'contacto' },
  { path: '/diario', name: 'diario' },
];

/** The three launch articles (`/diario/:slug`, `posts.manifest.json`). */
export const ARTICLE_ROUTES: readonly RouteFixture[] = [
  { path: '/diario/cuanto-dura-coloracion-sin-amoniaco', name: 'diario-coloracion' },
  { path: '/diario/como-cuidar-rastas-para-que-duren', name: 'diario-rastas' },
  { path: '/diario/babylights-o-balayage-diferencias', name: 'diario-babylights' },
];

/** All 15 prerendered routes (12 registry + 3 articles). */
export const ALL_ROUTES: readonly RouteFixture[] = [
  ...OTHER_REGISTRY_ROUTES,
  ...SERVICE_ROUTES,
  ...ARTICLE_ROUTES,
];
