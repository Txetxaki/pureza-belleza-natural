import { describe, expect, it } from 'vitest';
import { pricingFor } from '../../services/domain/pricing';
import type { ServicePricing } from '../../services/domain/pricing';
import { SCHEMA_ID } from '../domain/schema-ids';
import { buildServiceSchema } from './service.schema';

const BASE_INPUT = {
  path: 'rastas' as const,
  name: 'Rastas',
  description: 'Creación y mantenimiento de rastas en Ciudad Real.',
};

describe('buildServiceSchema (seo-infrastructure spec, "No offers node at launch"; pricing spec, "Confirmed entry unlocks Offer")', () => {
  it('omits the offers key entirely while pricing is pending — not merely undefined-valued', () => {
    const parsed = JSON.parse(
      JSON.stringify(buildServiceSchema({ ...BASE_INPUT, pricing: pricingFor('rastas') })),
    ) as Record<string, unknown>;

    expect('offers' in parsed).toBe(false);
  });

  it('produces a valid, parseable Service block referencing the stable HairSalon @id', () => {
    const parsed = JSON.parse(
      JSON.stringify(buildServiceSchema({ ...BASE_INPUT, pricing: pricingFor('rastas') })),
    ) as Record<string, unknown>;

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('Service');
    expect(parsed['@id']).toBe(SCHEMA_ID.service('rastas'));
    expect(parsed['provider']).toEqual({ '@id': SCHEMA_ID.salon });
    expect(parsed['areaServed']).toEqual({ '@type': 'City', name: 'Ciudad Real' });
    expect(parsed['name']).toBe(BASE_INPUT.name);
    expect(parsed['description']).toBe(BASE_INPUT.description);
  });

  it('includes an Offer node with the confirmed price once pricing flips to confirmed', () => {
    const confirmed: ServicePricing = {
      status: 'confirmed',
      path: 'rastas',
      fromEur: 65,
      durationMinutes: 90,
      rows: [],
      note: '',
    };
    const parsed = JSON.parse(
      JSON.stringify(buildServiceSchema({ ...BASE_INPUT, pricing: confirmed })),
    ) as Record<string, unknown>;

    expect(parsed['offers']).toEqual({ '@type': 'Offer', price: 65, priceCurrency: 'EUR' });
  });
});
