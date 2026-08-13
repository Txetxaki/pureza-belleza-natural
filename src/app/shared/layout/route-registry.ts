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
  /** Non-service, non-home, non-reserve entries — left of the wordmark. */
  readonly navLeft: readonly NavRouteEntry[];
  /** The `Carta` dropdown's entries — live service routes only, never a
   * `/servicios` index (anti-cannibalization rule 1). Empty until the first
   * service route flips live (Slice 4). */
  readonly dropdownServices: readonly NavRouteEntry[];
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
  const reservar = entries.find((entry) => entry.path === 'reservar');
  const liveInNav = entries.filter((entry) => entry.status === 'live' && entry.inNav);

  const wordmark = toNavEntry(
    home ?? { path: '', breadcrumb: 'Pureza', planta: null, status: 'live', inNav: true },
  );

  const navLeft = liveInNav
    .filter((entry) => entry.path !== '' && entry.path !== 'reservar' && !isServiceEntry(entry))
    .map(toNavEntry);

  const dropdownServices = entries
    .filter(isServiceEntry)
    .filter((entry) => entry.status === 'live')
    .map(toNavEntry);

  const reserveCta = reservar && reservar.status === 'live' ? toNavEntry(reservar) : undefined;

  return { wordmark, navLeft, dropdownServices, reserveCta };
}
