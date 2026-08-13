import { describe, expect, it } from 'vitest';
import { SCHEMA_ID } from '../domain/schema-ids';
import { buildPersonSchema } from './person.schema';

describe('buildPersonSchema (seo-infrastructure spec, "All four generators produce valid JSON-LD"; virginia-page spec, "Person @id is stable and referenced")', () => {
  it('produces a valid, parseable Person object with a stable @id, a name, and worksFor referencing the HairSalon @id', () => {
    // Round-trip through JSON to test what actually ships in the
    // <script type="application/ld+json"> tag, not just the in-memory object.
    const parsed = JSON.parse(JSON.stringify(buildPersonSchema())) as Record<string, unknown>;

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('Person');
    expect(parsed['@id']).toBe(SCHEMA_ID.person);
    expect(typeof parsed['name']).toBe('string');
    expect((parsed['name'] as string).length).toBeGreaterThan(0);
    expect(parsed['worksFor']).toEqual({ '@id': SCHEMA_ID.salon });
  });

  it('the @id is stable across multiple calls — a fixed, deterministic IRI, not derived per-call', () => {
    const first = buildPersonSchema();
    const second = buildPersonSchema();
    expect(first['@id']).toBe(second['@id']);
    expect(first['@id']).toBe(SCHEMA_ID.person);
  });
});
