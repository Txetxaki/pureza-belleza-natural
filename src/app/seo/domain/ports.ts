// Port contracts (design.md §4) — `seo/infrastructure/` adapters implement
// these against `DOCUMENT`; `SeoService` (application layer) depends only on
// these abstract classes, never on a concrete adapter. Abstract classes (not
// plain `interface`s) so they double as Angular DI tokens — `app.config.ts`
// binds them to concrete adapters with `{ provide: MetadataPort, useClass: ... }`.

export interface OpenGraphProps {
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly type?: string;
}

export interface TwitterCardProps {
  readonly title: string;
  readonly description: string;
}

/**
 * DOM metadata port. Every setter MUST upsert (query existing node, replace
 * its value) rather than append — the same "never duplicate on re-navigation"
 * contract as `JsonLdPort` below (design.md risk C).
 */
export abstract class MetadataPort {
  abstract setTitle(title: string): void;
  abstract setDescription(description: string): void;
  abstract setCanonical(url: string): void;
  abstract setOpenGraph(props: OpenGraphProps): void;
  abstract setTwitterCard(props: TwitterCardProps): void;
}

/**
 * JSON-LD injection port. `upsert` MUST query-and-replace by
 * `[data-pz-schema="id"]`, never blind-append — prerendered HTML already
 * contains the node, so client-side hydration must replace it, not duplicate
 * it (design.md risk C).
 */
export abstract class JsonLdPort {
  abstract upsert(id: string, schema: Record<string, unknown>): void;
}
