import type { ServicePath } from '../../services/domain/service-index';
import type { ServicePricing } from '../../services/domain/pricing';
import { SCHEMA_ID, salonRef } from '../domain/schema-ids';

export interface ServiceSchemaInput {
  readonly path: ServicePath;
  readonly name: string;
  readonly description: string;
  readonly pricing: ServicePricing;
}

/**
 * `@type: "Service"` — one node per plant-owning route, `provider`
 * referencing the single `HairSalon` `@id` (design.md, JSON-LD entity
 * graph). `offers` is present ONLY when `pricing.status === 'confirmed'`
 * (design.md D4) — while pending, the key is structurally absent, not
 * `undefined`-valued, so a parsed/stringified block can never carry a
 * fabricated `Offer` beside a visible "Consultar" (seo-infrastructure spec,
 * "No offers node at launch"; pricing spec, "Confirmed entry unlocks
 * Offer").
 */
export function buildServiceSchema(c: ServiceSchemaInput): Record<string, unknown> {
  const base = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': SCHEMA_ID.service(c.path),
    name: c.name,
    description: c.description,
    areaServed: { '@type': 'City', name: 'Ciudad Real' },
    provider: salonRef(),
  };
  return c.pricing.status === 'confirmed'
    ? { ...base, offers: { '@type': 'Offer', price: c.pricing.fromEur, priceCurrency: 'EUR' } }
    : base;
}
