import { describe, expect, it } from 'vitest';
import { SERVICE_INDEX, type ServicePath } from './service-index';
import {
  formatDuration,
  formatFrom,
  PRICING,
  PRICING_INDEX,
  pricingFor,
  type ServicePricing,
} from './pricing';

describe('pricing ↔ SERVICE_INDEX bijection (pricing spec, "Bijection holds", "Drift is caught")', () => {
  it('every SERVICE_INDEX path has exactly one pricing entry', () => {
    for (const entry of SERVICE_INDEX) {
      expect(() => pricingFor(entry.path)).not.toThrow();
    }
  });

  it('the pricing entry key set exactly matches the SERVICE_INDEX path set — no orphans, no gaps', () => {
    const servicePaths = SERVICE_INDEX.map((entry) => entry.path).sort();
    const pricingPaths = (Object.keys(PRICING) as ServicePath[]).sort();
    expect(pricingPaths).toEqual(servicePaths);
  });

  it('PRICING_INDEX is in SERVICE_INDEX order and has the same length', () => {
    expect(PRICING_INDEX).toHaveLength(SERVICE_INDEX.length);
    expect(PRICING_INDEX.map((entry) => entry.path)).toEqual(
      SERVICE_INDEX.map((entry) => entry.path),
    );
  });
});

describe('pending state — no invented values (pricing spec)', () => {
  it('all five entries are status: pending at launch (BRIEF: never invent a figure)', () => {
    expect(Object.values(PRICING).every((entry) => entry.status === 'pending')).toBe(true);
  });

  it('every pending entry has both fromEur and durationMinutes null — never independently pending/confirmed', () => {
    for (const entry of Object.values(PRICING)) {
      expect(entry.fromEur).toBeNull();
      expect(entry.durationMinutes).toBeNull();
    }
  });

  it('every entry carries at least one tariff row, all priced "Consultar" at launch', () => {
    for (const entry of Object.values(PRICING)) {
      expect(entry.rows.length).toBeGreaterThan(0);
      expect(entry.rows.every((row) => row.price === 'Consultar')).toBe(true);
    }
  });
});

describe('formatFrom', () => {
  it('renders "Consultar" for a pending entry', () => {
    expect(formatFrom(pricingFor('rastas'))).toBe('Consultar');
  });

  it('renders "Desde {fromEur} €" for a confirmed entry', () => {
    const confirmed: ServicePricing = {
      status: 'confirmed',
      path: 'rastas',
      fromEur: 65,
      durationMinutes: 90,
      rows: [],
      note: '',
    };
    expect(formatFrom(confirmed)).toBe('Desde 65 €');
  });
});

describe('formatDuration', () => {
  it('renders "Consultar" for a pending entry — never an approximate figure', () => {
    expect(formatDuration(pricingFor('rastas'))).toBe('Consultar');
  });

  it('renders "{durationMinutes} min" for a confirmed entry', () => {
    const confirmed: ServicePricing = {
      status: 'confirmed',
      path: 'rastas',
      fromEur: 65,
      durationMinutes: 90,
      rows: [],
      note: '',
    };
    expect(formatDuration(confirmed)).toBe('90 min');
  });
});

describe('pricingFor', () => {
  it('throws loudly for an unknown path (fail fast, not silent)', () => {
    expect(() => pricingFor('does-not-exist' as ServicePath)).toThrow(/no pricing entry/);
  });
});
