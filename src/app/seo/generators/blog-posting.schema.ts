import { canonicalUrl } from '../domain/route-seo';
import { personRef } from '../domain/schema-ids';

export interface BlogPostingInput {
  readonly slug: string;
  readonly headline: string;
  readonly description: string;
  /** ISO 8601 date, e.g. `'2026-06-15'` — never a fabricated per-build date. */
  readonly datePublished: string;
}

/**
 * `@type: "BlogPosting"` — one node per `/diario/:slug` article (design.md
 * Data Flow, "JSON-LD entity graph"; deferred from Slice 1 to its first real
 * consumer, tasks.md 8.8). `author` references the stable `Person` `@id`
 * (schema-ids.ts) — the SAME constant `/virginia`'s `Person` block emits, so
 * the two can never drift apart (virginia-page spec, "Person @id is stable
 * and referenced").
 */
export function buildBlogPostingSchema(c: BlogPostingInput): Record<string, unknown> {
  const url = canonicalUrl(`diario/${c.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: c.headline,
    description: c.description,
    datePublished: c.datePublished,
    url,
    author: personRef(),
  };
}
