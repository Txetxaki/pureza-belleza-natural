// The pricing source of truth (design.md D4, `pricing` spec) — one entry
// per plant-owning service route, keyed by its `route-seo.registry.json`
// `path`. `/precios`, the home carta and each service page's price section
// all read this same module, so a figure can never diverge across the site
// (pricing spec, "One source, three consumers").
import { SERVICE_INDEX, type ServicePath } from './service-index';

/**
 * One row of a service's tariff table (Stitch reading, item 9). `price` is
 * a pre-formatted display string — the same convention `pz-plate.price`
 * uses (design.md "Carta price column"): components receive ready-to-render
 * text, never a raw number or a `ServicePricing` object.
 */
export interface TariffRow {
  readonly label: string;
  readonly price: string;
}

/**
 * Discriminated union on `status` (design.md D4, Interfaces/Contracts): the
 * `pending` branch types `fromEur`/`durationMinutes` as `null`, so
 * `buildServiceSchema` (seo/generators/service.schema.ts) has no `number` in
 * scope to fabricate an `Offer` from while a price is still pending —
 * decision #2267 becomes a compile error to violate, not a comment.
 */
export type ServicePricing =
  | {
      readonly status: 'pending';
      readonly path: ServicePath;
      readonly fromEur: null;
      readonly durationMinutes: null;
      readonly rows: readonly TariffRow[];
      readonly note: string;
    }
  | {
      readonly status: 'confirmed';
      readonly path: ServicePath;
      readonly fromEur: number;
      readonly durationMinutes: number;
      readonly rows: readonly TariffRow[];
      readonly note: string;
    };

const PENDING_NOTE = 'El precio final depende de la longitud y densidad del cabello.';

/**
 * All five entries `status: 'pending'` at launch — do not invent a figure
 * (BRIEF §"Critical implementation details"; pricing spec "Pending state —
 * no invented values"). `Record<ServicePath, …>` requires exactly the five
 * `ServicePath` keys, so a missing entry is a compile error; the runtime
 * bijection spec in `pricing.spec.ts` additionally guards against the
 * reverse drift (an orphan key surviving after a route loses its `planta`).
 */
export const PRICING: Readonly<Record<ServicePath, ServicePricing>> = {
  'coloracion-vegetal-aveda': {
    status: 'pending',
    path: 'coloracion-vegetal-aveda',
    fromEur: null,
    durationMinutes: null,
    rows: [
      { label: 'Coloración vegetal completa', price: 'Consultar' },
      { label: 'Retoque de raíz', price: 'Consultar' },
    ],
    note: PENDING_NOTE,
  },
  'mechas-babylights-balayage': {
    status: 'pending',
    path: 'mechas-babylights-balayage',
    fromEur: null,
    durationMinutes: null,
    rows: [
      { label: 'Babylights', price: 'Consultar' },
      { label: 'Balayage sin decolorar', price: 'Consultar' },
    ],
    note: PENDING_NOTE,
  },
  rastas: {
    status: 'pending',
    path: 'rastas',
    fromEur: null,
    durationMinutes: null,
    rows: [
      { label: 'Creación de rastas', price: 'Consultar' },
      { label: 'Mantenimiento de rastas', price: 'Consultar' },
    ],
    note: PENDING_NOTE,
  },
  'extensiones-cabello-natural': {
    status: 'pending',
    path: 'extensiones-cabello-natural',
    fromEur: null,
    durationMinutes: null,
    rows: [
      { label: 'Extensiones de cabello natural', price: 'Consultar' },
      { label: 'Mantenimiento de extensiones', price: 'Consultar' },
    ],
    note: PENDING_NOTE,
  },
  'tratamientos-capilares': {
    status: 'pending',
    path: 'tratamientos-capilares',
    fromEur: null,
    durationMinutes: null,
    rows: [
      { label: 'Ritual capilar botánico', price: 'Consultar' },
      { label: 'Tratamiento reparador intensivo', price: 'Consultar' },
    ],
    note: PENDING_NOTE,
  },
};

/**
 * Looks up one pricing entry by its service path, or throws — same
 * fail-fast contract as `seoData` (seo/domain/route-seo.ts).
 */
export function pricingFor(path: ServicePath): ServicePricing {
  const entry = PRICING[path];
  if (!entry) {
    throw new Error(`[pricing] no pricing entry for path "${path}"`);
  }
  return entry;
}

/** Every pricing entry, in `SERVICE_INDEX` order. */
export const PRICING_INDEX: readonly ServicePricing[] = SERVICE_INDEX.map((entry) =>
  pricingFor(entry.path),
);

/**
 * `'Consultar'` while pending — never a number. Once `status === 'confirmed'`
 * renders `'Desde {fromEur} €'`.
 */
export const formatFrom = (pricing: ServicePricing): string =>
  pricing.status === 'pending' ? 'Consultar' : `Desde ${pricing.fromEur} €`;

/**
 * `'Consultar'` while pending — duration MUST carry the same pending flag as
 * price (pricing spec, "Pending price implies pending duration"), never an
 * approximate figure. Once confirmed renders `'{durationMinutes} min'`.
 */
export const formatDuration = (pricing: ServicePricing): string =>
  pricing.status === 'pending' ? 'Consultar' : `${pricing.durationMinutes} min`;
