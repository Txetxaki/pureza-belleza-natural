// The five plant-owned service routes, derived from `ROUTE_SEO_REGISTRY`
// (design.md Data Flow diagram, D2) — never hand-maintained, so a route
// gaining or losing its `planta` ownership updates every consumer (header
// dropdown, home frieze/carta, `/precios`, `pz-service-anchor`) with zero
// additional edits.
import { ROUTE_SEO_REGISTRY, type Planta, type RouteSeo } from '../../seo/domain/route-seo';

/** The five plant-owned service routes' `path` values — no leading slash. */
export type ServicePath =
  | 'coloracion-vegetal-aveda'
  | 'mechas-babylights-balayage'
  | 'rastas'
  | 'extensiones-cabello-natural'
  | 'tratamientos-capilares';

/** A `RouteSeo` entry narrowed to its plant-owning shape. */
export interface ServiceIndexEntry extends RouteSeo {
  readonly path: ServicePath;
  readonly planta: Planta;
}

function isServiceEntry(entry: RouteSeo): entry is ServiceIndexEntry {
  return entry.planta !== null;
}

/**
 * The five plant-owned service routes, in registry order. A registry route
 * gaining or losing a non-null `planta` changes this list automatically —
 * that is the drift-proofing this module exists for (design.md Data Flow).
 */
export const SERVICE_INDEX: readonly ServiceIndexEntry[] =
  ROUTE_SEO_REGISTRY.filter(isServiceEntry);

/**
 * Looks up one `SERVICE_INDEX` entry by path, or throws — same fail-fast
 * contract as `seoData` (seo/domain/route-seo.ts).
 */
export function serviceIndexEntry(path: ServicePath): ServiceIndexEntry {
  const entry = SERVICE_INDEX.find((candidate) => candidate.path === path);
  if (!entry) {
    throw new Error(`[service-index] no SERVICE_INDEX entry for path "${path}"`);
  }
  return entry;
}
