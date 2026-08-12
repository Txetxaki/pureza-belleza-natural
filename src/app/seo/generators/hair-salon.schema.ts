import { SITE } from '../domain/site';

/**
 * `@type: "HairSalon"` — confirmed real schema.org subtype (Thing > Place >
 * LocalBusiness > HealthAndBeautyBusiness > HairSalon; Engram decision #2291,
 * project "virginia"), not the generic `LocalBusiness`. Emitted once, from the
 * home route (design.md §4/§7).
 */
export function buildHairSalonSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: SITE.name,
    url: SITE.url,
    telephone: SITE.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.streetAddress,
      postalCode: SITE.postalCode,
      addressLocality: SITE.addressLocality,
      addressCountry: SITE.addressCountry,
    },
  };
}
