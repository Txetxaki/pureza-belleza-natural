// The blog post source of truth (design.md D6, `diario` spec): one JSON
// entry per launch article, joined by `slug` to its standalone body
// component here — the SAME proven pattern as `route-seo.registry.json` /
// `route-seo.ts`. `generate-sitemap.mjs` and `validate-keyword-uniqueness.mjs`
// re-read `posts.manifest.json` directly via `node:fs` (a plain `.mjs`
// cannot import project TypeScript), same accepted split as the route
// registry's own script consumers.
import type { Type } from '@angular/core';
import manifestData from '../posts.manifest.json';
import { CuantoDuraColoracionSinAmoniacoPost } from '../posts/cuanto-dura-coloracion-sin-amoniaco/cuanto-dura-coloracion-sin-amoniaco-post';
import { ComoCuidarRastasParaQueDurenPost } from '../posts/como-cuidar-rastas-para-que-duren/como-cuidar-rastas-para-que-duren-post';
import { BabylightsOBalayageDiferenciasPost } from '../posts/babylights-o-balayage-diferencias/babylights-o-balayage-diferencias-post';

export interface PostManifestEntry {
  readonly slug: string;
  readonly title: string;
  /** ≤ 155 chars — meta description AND the `BlogPosting.description` value. */
  readonly description: string;
  /** One-line summary rendered on `/diario`'s index list. */
  readonly standfirst: string;
  /** ISO 8601 date, e.g. `'2026-06-15'` — a single, consistent launch date;
   * never a fabricated per-build date. */
  readonly publishedAt: string;
}

export const POSTS_MANIFEST: readonly PostManifestEntry[] = manifestData;

/**
 * `slug` → body component `Type`, joined here (design.md D6) so
 * `post-page.ts` (the `NgComponentOutlet` shell) never hand-maintains a
 * second slug→component switch. A bijection spec asserts every manifest
 * slug has a matching entry here and vice versa.
 */
export const POST_COMPONENTS: Readonly<Record<string, Type<unknown>>> = {
  'cuanto-dura-coloracion-sin-amoniaco': CuantoDuraColoracionSinAmoniacoPost,
  'como-cuidar-rastas-para-que-duren': ComoCuidarRastasParaQueDurenPost,
  'babylights-o-balayage-diferencias': BabylightsOBalayageDiferenciasPost,
};

/** Every manifest slug, in manifest order — `getPrerenderParams()` (design.md
 * Data Flow) maps this 1:1 to the three prerendered `/diario/:slug` paths. */
export const POST_SLUGS: readonly string[] = POSTS_MANIFEST.map((entry) => entry.slug);

export function postManifestEntry(slug: string): PostManifestEntry | undefined {
  return POSTS_MANIFEST.find((entry) => entry.slug === slug);
}

export function postComponentFor(slug: string): Type<unknown> | undefined {
  return POST_COMPONENTS[slug];
}
