import { SCHEMA_ID } from '../domain/schema-ids';
import { SITE, type DayHours, type DayOfWeek } from '../domain/site';

/**
 * `@type: "HairSalon"` — confirmed real schema.org subtype (Thing > Place >
 * LocalBusiness > HealthAndBeautyBusiness > HairSalon; Engram decision #2291,
 * project "virginia"), not the generic `LocalBusiness`. Emitted once, from the
 * home route (design.md §4/§7). Carries a stable `@id` (design.md, JSON-LD
 * entity graph) so `Service.provider` and `Person.worksFor` can reference
 * one entity graph instead of orphan nodes (seo-infrastructure spec, "@id
 * stable and referenced by other nodes").
 */
export interface OpeningHoursSpecification {
  readonly '@type': 'OpeningHoursSpecification';
  readonly dayOfWeek: readonly DayOfWeek[];
  readonly opens: string;
  readonly closes: string;
}

/**
 * One `OpeningHoursSpecification` per distinct opening window, with every day
 * that shares it — Monday/Tuesday/Thursday mornings collapse into one node
 * instead of three. Closed days are simply absent, which is how schema.org
 * expresses "closed". Order follows the week, so the output is deterministic.
 */
export function buildOpeningHoursSpecification(
  week: readonly DayHours[],
): OpeningHoursSpecification[] {
  const byWindow = new Map<string, { opens: string; closes: string; days: DayOfWeek[] }>();
  for (const day of week) {
    for (const period of day.periods) {
      const key = `${period.opens}-${period.closes}`;
      const entry = byWindow.get(key) ?? { ...period, days: [] };
      entry.days.push(day.day);
      byWindow.set(key, entry);
    }
  }
  return [...byWindow.values()].map((window) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: window.days,
    opens: window.opens,
    closes: window.closes,
  }));
}

/**
 * Deliberately NO `aggregateRating`/`review`: the 5,0 Google rating is shown
 * on the page as plain text only. Google treats self-served reviews on a
 * LocalBusiness as ineligible, so marking them up buys nothing but risk.
 */
export function buildHairSalonSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': SCHEMA_ID.salon,
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
    openingHoursSpecification: buildOpeningHoursSpecification(SITE.openingHours),
    sameAs: [SITE.instagramUrl],
  };
}
