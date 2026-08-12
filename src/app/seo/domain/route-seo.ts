// The typed face of `../route-seo.registry.json` — design.md §4's single
// source of truth, read by `SeoService` at runtime, by
// `scripts/validate-keyword-uniqueness.mjs` at prebuild, and by
// `scripts/generate-sitemap.mjs` at postbuild (that script re-parses the JSON
// directly via `node:fs`, since a plain `.mjs` cannot import project TypeScript
// — see the comment there).
import registryData from '../route-seo.registry.json';
import { SITE } from './site';

/** One accent per single-service route (design.md §1). */
export type Planta = 'romero' | 'espliego' | 'esparto' | 'vid' | 'olivo';

export interface RouteSeo {
  /** Angular path, no leading slash. `''` is the home route. */
  readonly path: string;
  /** ≤ 60 chars — enforced by `validate-keyword-uniqueness.mjs`. */
  readonly title: string;
  /** ≤ 155 chars — enforced by `validate-keyword-uniqueness.mjs`. */
  readonly description: string;
  /** `null` = deliberately untargeted/navigational (`/contacto`, `/el-salon`, `/diario`). */
  readonly primaryKeyword: string | null;
  readonly breadcrumb: string;
  /** Accent owner — at most one route per plant, enforced at prebuild. */
  readonly planta: Planta | null;
  readonly changefreq: 'weekly' | 'monthly' | 'yearly';
  /** 0..1 — enforced by `validate-keyword-uniqueness.mjs`. */
  readonly priority: number;
  readonly inNav: boolean;
  /** `'planned'` ships in the future `content` change; only flips here, never restructures. */
  readonly status: 'live' | 'planned';
}

/** All twelve routes — ten `planned` now, so anti-cannibalization already guards them. */
export const ROUTE_SEO_REGISTRY: readonly RouteSeo[] = registryData as RouteSeo[];

export function getRouteSeo(path: string): RouteSeo | undefined {
  return ROUTE_SEO_REGISTRY.find((entry) => entry.path === path);
}

/**
 * Looks up one registry entry by path, or throws. Used to build `route.data`
 * (`seoRouteData(path)` below) — a route shipped with a typo'd or missing
 * registry path fails loudly at module-evaluation time instead of silently
 * rendering without metadata.
 */
export function seoData(path: string): RouteSeo {
  const entry = getRouteSeo(path);
  if (!entry) {
    throw new Error(`[seo] no route-seo.registry.json entry for path "${path}"`);
  }
  return entry;
}

/** `{ data: seoRouteData('contacto') }` — the one-line wiring PR5's route table uses. */
export function seoRouteData(path: string): { seo: RouteSeo } {
  return { seo: seoData(path) };
}

/**
 * The canonical-URL rule (design.md risk E) — expressed here AND, necessarily
 * duplicated with a matching algorithm, in `scripts/generate-sitemap.mjs`'s
 * `pathToUrl` (a plain script can't import this TS module at build time). Both
 * must agree: `SITE.url` + `/` for the home path, `SITE.url + '/' + path`
 * otherwise, no trailing slash on non-home paths. A future Playwright check
 * (PR5, design.md risk E mitigation) asserts each prerendered page's
 * `<link rel="canonical">` equals its `sitemap.xml` entry — drift between the
 * two implementations fails that gate.
 */
export function canonicalUrl(path: string): string {
  return `${SITE.url}${path === '' ? '/' : `/${path}`}`;
}
