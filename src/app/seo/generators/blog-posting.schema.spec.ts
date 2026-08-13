import { describe, expect, it } from 'vitest';
import { SCHEMA_ID } from '../domain/schema-ids';
import { canonicalUrl } from '../domain/route-seo';
import { buildPersonSchema } from './person.schema';
import { buildBlogPostingSchema } from './blog-posting.schema';

const INPUT = {
  slug: 'cuanto-dura-coloracion-sin-amoniaco',
  headline: '¿Cuánto dura una coloración sin amoniaco?',
  description: 'Qué factores alargan o acortan una coloración vegetal.',
  datePublished: '2026-06-15',
};

describe('buildBlogPostingSchema (seo-infrastructure spec, "All four generators produce valid JSON-LD"; diario spec, "Three prerendered posts"; virginia-page spec, "Person @id is stable and referenced")', () => {
  it('produces a valid, parseable BlogPosting object with the article URL, headline, description and datePublished', () => {
    const parsed = JSON.parse(JSON.stringify(buildBlogPostingSchema(INPUT))) as Record<
      string,
      unknown
    >;

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('BlogPosting');
    expect(parsed['headline']).toBe(INPUT.headline);
    expect(parsed['description']).toBe(INPUT.description);
    expect(parsed['datePublished']).toBe(INPUT.datePublished);
    expect(parsed['url']).toBe(canonicalUrl(`diario/${INPUT.slug}`));
  });

  it('author references the SAME Person @id /virginia emits — not a re-typed literal', () => {
    const blogPosting = JSON.parse(JSON.stringify(buildBlogPostingSchema(INPUT))) as Record<
      string,
      unknown
    >;
    const person = JSON.parse(JSON.stringify(buildPersonSchema())) as Record<string, unknown>;

    expect(blogPosting['author']).toEqual({ '@id': SCHEMA_ID.person });
    expect((blogPosting['author'] as { '@id': string })['@id']).toBe(person['@id']);
  });

  it('the article @id is stable across multiple calls for the same slug', () => {
    const first = buildBlogPostingSchema(INPUT);
    const second = buildBlogPostingSchema(INPUT);
    expect(first['@id']).toBe(second['@id']);
  });
});
