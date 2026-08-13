// SEAM RESOLVED (PR4): the real route registry now lives at
// `seo/route-seo.registry.json`, typed via `seo/domain/route-seo.ts`
// (design.md §4). This file re-derives `site-header`'s nav-projection shape
// (`NavRouteEntry`) from that single source instead of hardcoding a second
// copy of the two live routes — `filterNavEntries`'s contract and
// `site-header.ts`'s consumption of it are unchanged. See
// `sdd/foundation/apply-progress` (Engram, project "virginia") for the full
// seam history.
//
// `content` slice 3 (design.md D7) adds `buildHeaderNav`: the header can no
// longer use a single flat `@for` over `filterNavEntries` once the five
// service routes and `/reservar` exist in the registry — that would render
// up to 11 links in one row. `buildHeaderNav` is a pure projection into the
// header's three zones (nav-left, wordmark, dropdown, reserve CTA), unit
// tested directly against fixture registries so the "flip a status back and
// the link disappears everywhere" rollback property (D7) is proven, not
// asserted by prose. The footer keeps the flat `filterNavEntries(NAV_ROUTES)`
// projection unchanged — a single centred link row can hold all twelve.
import { ROUTE_SEO_REGISTRY, type Planta, type RouteSeo } from '../../seo/domain/route-seo';

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

/** The subset of `RouteSeo` `buildHeaderNav` actually reads — keeps its unit
 * spec's fixtures short (no need to fabricate `title`/`description`/etc. per
 * row) while still accepting the real `ROUTE_SEO_REGISTRY` as-is. */
export type HeaderNavSourceEntry = Pick<
  RouteSeo,
  'path' | 'breadcrumb' | 'planta' | 'status' | 'inNav'
>;

export interface HeaderNav {
  /** Always `'Pureza'`, centred (app-shell spec: "Wordmark centred"). */
  readonly wordmark: NavRouteEntry;
  /** Non-service, non-home, non-reserve, non-diario entries — left of the
   * wordmark. `diario` is excluded for the same reason `reservar` is: it owns
   * its own zone (a disclosure whose panel holds its child articles), so
   * leaving it here too would render the label twice. */
  readonly navLeft: readonly NavRouteEntry[];
  /** The `Carta` dropdown's entries — live service routes only, never a
   * `/servicios` index (anti-cannibalization rule 1). Empty until the first
   * service route flips live (Slice 4). */
  readonly dropdownServices: readonly NavRouteEntry[];
  /** The `Diario` disclosure's own trigger entry. `undefined` until `/diario`
   * is live and in-nav, exactly like `reserveCta` — no dead trigger. The
   * articles that hang beneath it are NOT registry rows (they live in
   * `posts.manifest.json`), so the header composes them separately via
   * `buildDiarioNav`. */
  readonly diarioParent: NavRouteEntry | undefined;
  /** `undefined` until `/reservar` itself flips live — no dead CTA link. */
  readonly reserveCta: NavRouteEntry | undefined;
}

function toNavEntry(entry: HeaderNavSourceEntry): NavRouteEntry {
  return {
    path: entry.path,
    label: entry.path === '' ? 'Pureza' : entry.breadcrumb,
    status: entry.status,
    inNav: entry.inNav,
  };
}

const isServiceEntry = (
  entry: HeaderNavSourceEntry,
): entry is HeaderNavSourceEntry & { planta: Planta } => entry.planta !== null;

/**
 * Pure three-zone (plus wordmark) projection for the header (design.md D7).
 * Every zone is derived from `status`/`inNav` alone — nothing is hardcoded,
 * so flipping a registry entry's `status` grows or shrinks the header with
 * zero further edits to this function or its callers.
 */
export function buildHeaderNav(entries: readonly HeaderNavSourceEntry[]): HeaderNav {
  const home = entries.find((entry) => entry.path === '');
  const liveInNav = entries.filter((entry) => entry.status === 'live' && entry.inNav);
  const ownsOwnZone = (path: string) => path === 'reservar' || path === 'diario';

  const wordmark = toNavEntry(
    home ?? { path: '', breadcrumb: 'Pureza', planta: null, status: 'live', inNav: true },
  );

  const navLeft = liveInNav
    .filter((entry) => entry.path !== '' && !ownsOwnZone(entry.path) && !isServiceEntry(entry))
    .map(toNavEntry);

  // Both zones below check `inNav` as well as `status`, matching `navLeft`
  // above, `filterNavEntries`, and the footer. Filtering on `status` alone
  // looks harmless today because every live entry also has `inNav: true` — but
  // `inNav: false` is a real, used state (the `virginia` entry ships that way),
  // so a soft-launched service route would appear in this dropdown while the
  // footer correctly omitted it. That would silently break the no-JS mitigation
  // the dropdown depends on: the footer carrying the same links.
  const dropdownServices = liveInNav.filter(isServiceEntry).map(toNavEntry);

  // Both derived from `liveInNav`, so each is `undefined` exactly when its
  // route is not shipped — the zone disappears rather than rendering a dead
  // trigger, and flipping the registry row back restores it with no edit here.
  const findLive = (path: string) => {
    const entry = liveInNav.find((candidate) => candidate.path === path);
    return entry ? toNavEntry(entry) : undefined;
  };

  return {
    wordmark,
    navLeft,
    dropdownServices,
    diarioParent: findLive('diario'),
    reserveCta: findLive('reservar'),
  };
}

/**
 * The three launch articles projected into the same `NavRouteEntry` shape as
 * every other nav link, so the `Diario` disclosure's panel and the footer's
 * article row can both consume them without either knowing about
 * `PostManifestEntry`. Paths are namespaced under the parent — a post is
 * reachable only through `/diario/<slug>`, which is precisely the "everything
 * hangs from its parent" rule this projection exists to encode.
 */
export function buildDiarioNav(
  posts: readonly { readonly slug: string; readonly title: string }[],
): NavRouteEntry[] {
  return posts.map((post) => ({
    path: `diario/${post.slug}`,
    label: post.title,
    status: 'live' as const,
    inNav: true,
  }));
}
