import { describe, expect, it } from 'vitest';
import { ROUTE_SEO_REGISTRY } from '../../seo/domain/route-seo';
import { SERVICE_INDEX, serviceIndexEntry } from './service-index';

describe('SERVICE_INDEX (pricing spec, "Bijection holds" — shared fixture with pricing.spec.ts)', () => {
  it('has exactly five entries — one per plant-owning registry route', () => {
    expect(SERVICE_INDEX).toHaveLength(5);
  });

  it('every entry is derived from the registry: same path, same planta', () => {
    for (const entry of SERVICE_INDEX) {
      const registryRow = ROUTE_SEO_REGISTRY.find((row) => row.path === entry.path);
      expect(registryRow).toBeDefined();
      expect(entry.planta).toBe(registryRow?.planta);
    }
  });

  it('contains no entry with a null planta', () => {
    expect(SERVICE_INDEX.every((entry) => entry.planta !== null)).toBe(true);
  });

  it('matches exactly the registry paths with a non-null planta (drift is caught)', () => {
    const expectedPaths = ROUTE_SEO_REGISTRY.filter((row) => row.planta !== null)
      .map((row) => row.path)
      .sort();
    const actualPaths = SERVICE_INDEX.map((entry) => entry.path).sort();
    expect(actualPaths).toEqual(expectedPaths);
  });

  it('serviceIndexEntry returns the matching entry for a known path', () => {
    expect(serviceIndexEntry('rastas').planta).toBe('esparto');
  });

  it('serviceIndexEntry throws loudly for an unknown path (fail fast, not silent)', () => {
    expect(() => serviceIndexEntry('does-not-exist' as never)).toThrow(/no SERVICE_INDEX entry/);
  });
});
