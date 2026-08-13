import { describe, expect, it } from 'vitest';
import { canonicalUrl, getRouteSeo, ROUTE_SEO_REGISTRY, seoData, seoRouteData } from './route-seo';
import { SITE } from './site';

describe('route-seo registry', () => {
  it('has exactly twelve routes, with /, /contacto and the two Slice 4 service routes live and the rest planned', () => {
    expect(ROUTE_SEO_REGISTRY).toHaveLength(12);
    const live = ROUTE_SEO_REGISTRY.filter((entry) => entry.status === 'live');
    expect(live.map((entry) => entry.path).sort()).toEqual([
      '',
      'coloracion-vegetal-aveda',
      'contacto',
      'mechas-babylights-balayage',
    ]);
  });

  it('seoData returns the matching entry for a live route', () => {
    expect(seoData('contacto').breadcrumb).toBe('Contacto');
    expect(getRouteSeo('nonexistent')).toBeUndefined();
  });

  it('seoData throws loudly for an unknown path (fail fast, not silent)', () => {
    expect(() => seoData('does-not-exist')).toThrow(/no route-seo\.registry\.json entry/);
  });

  it('seoRouteData wraps the entry under `seo` for route.data', () => {
    expect(seoRouteData('')).toEqual({ seo: seoData('') });
  });
});

describe('canonicalUrl (design.md risk E — must match scripts/generate-sitemap.mjs pathToUrl)', () => {
  it('maps the home path to the site root with a trailing slash', () => {
    expect(canonicalUrl('')).toBe(`${SITE.url}/`);
  });

  it('maps a non-home path with no trailing slash', () => {
    expect(canonicalUrl('contacto')).toBe(`${SITE.url}/contacto`);
  });
});
