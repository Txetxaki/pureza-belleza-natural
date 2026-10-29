import { describe, expect, it } from 'vitest';
import { SCHEMA_ID } from '../domain/schema-ids';
import { SITE } from '../domain/site';
import { buildHairSalonSchema, buildOpeningHoursSpecification } from './hair-salon.schema';

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

  it('publishes the Google Business opening hours as openingHoursSpecification, one node per opening window', () => {
    const parsed = JSON.parse(JSON.stringify(buildHairSalonSchema()));

    expect(parsed.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        opens: '10:00',
        closes: '14:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Thursday'],
        opens: '17:00',
        closes: '19:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday'],
        opens: '10:00',
        closes: '19:00',
      },
    ]);
  });

  it('expresses closed days (Wednesday, Sunday) by leaving them out of every window', () => {
    const days = buildOpeningHoursSpecification(SITE.openingHours).flatMap((spec) => spec.dayOfWeek);

    expect(days).not.toContain('Wednesday');
    expect(days).not.toContain('Sunday');
  });

  it('links the Instagram profile through sameAs', () => {
    expect(buildHairSalonSchema()['sameAs']).toEqual([
      'https://www.instagram.com/pureza_belleza_natural/',
    ]);
  });

  it('never marks up the Google rating — no aggregateRating or review on a self-served LocalBusiness', () => {
    const schema = buildHairSalonSchema();

    expect(schema).not.toHaveProperty('aggregateRating');
    expect(schema).not.toHaveProperty('review');
  });
});
