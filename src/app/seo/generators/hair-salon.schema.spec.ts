import { describe, expect, it } from 'vitest';
import { SCHEMA_ID } from '../domain/schema-ids';
import { SITE } from '../domain/site';
import { buildHairSalonSchema } from './hair-salon.schema';

describe('buildHairSalonSchema', () => {
  it('produces a valid, parseable schema.org HairSalon object with required fields and a stable @id', () => {
    // Round-trip through JSON to test what actually ships in the
    // <script type="application/ld+json"> tag, not just the in-memory object.
    const parsed = JSON.parse(JSON.stringify(buildHairSalonSchema()));

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('HairSalon');
    expect(parsed['@id']).toBe(SCHEMA_ID.salon);
    expect(typeof parsed.name).toBe('string');
    expect(parsed.name.length).toBeGreaterThan(0);
    expect(parsed.telephone).toBe(SITE.telephone);
    expect(parsed.url).toBe(SITE.url);

    expect(parsed.address['@type']).toBe('PostalAddress');
    expect(parsed.address.streetAddress).toBe(SITE.streetAddress);
    expect(parsed.address.postalCode).toBe(SITE.postalCode);
    expect(parsed.address.addressLocality).toBe(SITE.addressLocality);
    expect(parsed.address.addressCountry).toBe(SITE.addressCountry);
  });

  it('the @id is stable across multiple calls — a fixed, deterministic IRI (seo-infrastructure spec, "@id stable and referenced by other nodes")', () => {
    const first = buildHairSalonSchema();
    const second = buildHairSalonSchema();
    expect(first['@id']).toBe(second['@id']);
    expect(first['@id']).toBe(SCHEMA_ID.salon);
  });
});
