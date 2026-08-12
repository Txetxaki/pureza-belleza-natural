// SEAM RESOLVED (PR4): the real route registry now lives at
// `seo/route-seo.registry.json`, typed via `seo/domain/route-seo.ts`
// (design.md §4). This file re-derives `site-header`'s nav-projection shape
// (`NavRouteEntry`) from that single source instead of hardcoding a second
// copy of the two live routes — `filterNavEntries`'s contract and
// `site-header.ts`'s consumption of it are unchanged. See
// `sdd/foundation/apply-progress` (Engram, project "virginia") for the full
// seam history.
import { ROUTE_SEO_REGISTRY } from '../../seo/domain/route-seo';

export interface NavRouteEntry {
  /** Angular path, no leading slash. `''` is the home route. */
  readonly path: string;
  /** Visible label — the home entry doubles as the brand link. */
  readonly label: string;
  readonly status: 'live' | 'planned';
  readonly inNav: boolean;
}

export const NAV_ROUTES: NavRouteEntry[] = ROUTE_SEO_REGISTRY.map((entry) => ({
  path: entry.path,
  label: entry.path === '' ? 'Pureza' : entry.breadcrumb,
  status: entry.status,
  inNav: entry.inNav,
}));

/**
 * Pure filter — the one rule that must survive any registry swap unchanged:
 * an entry appears in navigation only when it is both shipped
 * (`status === 'live'`) and opted into navigation (`inNav`).
 */
export function filterNavEntries(entries: readonly NavRouteEntry[]): NavRouteEntry[] {
  return entries.filter((entry) => entry.status === 'live' && entry.inNav);
}
