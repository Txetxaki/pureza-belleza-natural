// Placeholder route registry — SEAM for PR4 (SEO infrastructure).
//
// design.md §4 defines the real registry as `seo/route-seo.registry.json`,
// typed via `seo/domain/route-seo.ts`, consumed by `SeoService`, the prebuild
// keyword validator, and the postbuild sitemap generator. That domain hasn't
// landed yet (PR4). `site-header` still needs *a* route source today, so this
// file exposes the same shape (a subset of `RouteSeo`: `path`, `inNav`,
// `status`) and the same filter contract the design calls for:
// `status === 'live' && inNav`.
//
// When PR4 lands the real registry, site-header's consumption pattern
// (`filterNavEntries`) does not change — only this constant's origin does.
// Swap `NAV_ROUTES` for a projection of the real `RouteSeo[]` registry (or
// re-export this module from the SEO domain) and delete this placeholder.
// Do not duplicate the two live routes' data anywhere else.
export interface NavRouteEntry {
  /** Angular path, no leading slash. `''` is the home route. */
  readonly path: string;
  /** Visible label — the home entry doubles as the brand link. */
  readonly label: string;
  readonly status: 'live' | 'planned';
  readonly inNav: boolean;
}

export const NAV_ROUTES: NavRouteEntry[] = [
  { path: '', label: 'Pureza', status: 'live', inNav: true },
  { path: 'contacto', label: 'Contacto', status: 'live', inNav: true },
];

/**
 * Pure filter — the one rule that must survive the PR4 registry swap
 * unchanged: an entry appears in navigation only when it is both shipped
 * (`status === 'live'`) and opted into navigation (`inNav`).
 */
export function filterNavEntries(entries: readonly NavRouteEntry[]): NavRouteEntry[] {
  return entries.filter((entry) => entry.status === 'live' && entry.inNav);
}
