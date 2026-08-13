import { SCHEMA_ID, salonRef } from '../domain/schema-ids';
import { canonicalUrl } from '../domain/route-seo';

/**
 * `@type: "Person"` — Virginia, the practitioner every `Service.provider`
 * and (Slice 8b) `BlogPosting.author` traces back to via `worksFor`/`author`
 * (design.md Data Flow, "JSON-LD entity graph"). Emitted once, from
 * `/virginia` (virginia-page spec, "Stable Person JSON-LD anchor"). Carries
 * a stable `@id` (schema-ids.ts) so the exact same value can be asserted
 * equal on a launch article's `BlogPosting.author` later without
 * re-deriving it (virginia-page spec, "Person @id is stable and referenced").
 *
 * Fields are deliberately limited to what's established (BRIEF §"Do not
 * invent"): her name, real job title, the salon page URL, and `worksFor` —
 * no fabricated years of experience, training history, awards,
 * certifications or client counts.
 */
export function buildPersonSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': SCHEMA_ID.person,
    name: 'Virginia',
    url: canonicalUrl('virginia'),
    jobTitle: 'Peluquera',
    worksFor: salonRef(),
  };
}
