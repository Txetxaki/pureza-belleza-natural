import { describe, expect, it } from 'vitest';
import { filterNavEntries, NAV_ROUTES, type NavRouteEntry } from './route-registry';

describe('filterNavEntries', () => {
  const fixture: NavRouteEntry[] = [
    { path: '', label: 'Pureza', status: 'live', inNav: true },
    { path: 'contacto', label: 'Contacto', status: 'live', inNav: true },
    { path: 'el-salon', label: 'El salón', status: 'planned', inNav: true },
    { path: 'coloracion-vegetal-aveda', label: 'Coloración vegetal', status: 'live', inNav: false },
  ];

  it('keeps only entries that are both live and inNav', () => {
    const result = filterNavEntries(fixture);
    expect(result.map((entry) => entry.path)).toEqual(['', 'contacto']);
  });

  it('drops planned entries even when inNav is true', () => {
    const result = filterNavEntries(fixture);
    expect(result.some((entry) => entry.path === 'el-salon')).toBe(false);
  });

  it('drops live entries opted out of navigation', () => {
    const result = filterNavEntries(fixture);
    expect(result.some((entry) => entry.path === 'coloracion-vegetal-aveda')).toBe(false);
  });

  it("today's real NAV_ROUTES yields exactly the brand link and /contacto", () => {
    expect(filterNavEntries(NAV_ROUTES).map((entry) => entry.path)).toEqual(['', 'contacto']);
  });
});
