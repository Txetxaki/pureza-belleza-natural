// Stable `@id` values for the JSON-LD entity graph (design.md Data Flow,
// "JSON-LD entity graph" diagram) — one `HairSalon` node and one `Person`
// node that `Service.provider`, `Person.worksFor` and `BlogPosting.author`
// all reference, instead of five orphan nodes. Reuses `canonicalUrl` so the
// URL-join algorithm has exactly one implementation (route-seo.ts risk E).
//
// No dedicated spec here — exercised indirectly by the generator specs that
// consume it (`service.schema.spec.ts`, `hair-salon.schema.spec.ts`, and
// Slice 6a/8b's `person.schema.spec.ts`/`blog-posting.schema.spec.ts`),
// whose assertions on `provider`/`worksFor`/`@id` equality are the real
// coverage (design.md, task 1.4).
import type { ServicePath } from '../../services/domain/service-index';
import { canonicalUrl } from './route-seo';

export const SCHEMA_ID = {
  /** `/` — the one `HairSalon` node every provider/business ref points to. */
  salon: `${canonicalUrl('')}#salon`,
  /** `/virginia` — the one `Person` node `worksFor`/`author` reference. */
  person: `${canonicalUrl('virginia')}#person`,
  /** One `Service` node per plant-owning route. */
  service: (path: ServicePath): string => `${canonicalUrl(path)}#service`,
} as const;

/** `{ '@id': SCHEMA_ID.salon }` — spread into `Service.provider`/`Person.worksFor`. */
export function salonRef(): { readonly '@id': string } {
  return { '@id': SCHEMA_ID.salon };
}

/** `{ '@id': SCHEMA_ID.person }` — spread into `BlogPosting.author`. */
export function personRef(): { readonly '@id': string } {
  return { '@id': SCHEMA_ID.person };
}
