import { describe, expect, it } from 'vitest';
import { SITE } from '../domain/site';
import { buildBreadcrumbListSchema } from './breadcrumb-list.schema';

describe('buildBreadcrumbListSchema', () => {
  it('produces a valid, parseable schema.org BreadcrumbList for any route', () => {
    const parsed = JSON.parse(
      JSON.stringify(
        buildBreadcrumbListSchema([
          { name: 'Inicio', path: '' },
          { name: 'Contacto', path: 'contacto' },
        ]),
      ),
    );

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('BreadcrumbList');
    expect(Array.isArray(parsed.itemListElement)).toBe(true);
    expect(parsed.itemListElement).toHaveLength(2);

    const [first, second] = parsed.itemListElement;
    expect(first['@type']).toBe('ListItem');
    expect(first.position).toBe(1);
    expect(first.name).toBe('Inicio');
    expect(first.item).toBe(`${SITE.url}/`);

    expect(second.position).toBe(2);
    expect(second.name).toBe('Contacto');
    expect(second.item).toBe(`${SITE.url}/contacto`);
  });

  it('is generic to any single-item route (no hardcoded 2-level assumption)', () => {
    const parsed = JSON.parse(JSON.stringify(buildBreadcrumbListSchema([{ name: 'Inicio', path: '' }])));
    expect(parsed.itemListElement).toHaveLength(1);
    expect(parsed.itemListElement[0].item).toBe(`${SITE.url}/`);
  });
});
