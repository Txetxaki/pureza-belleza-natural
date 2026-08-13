import { describe, expect, it } from 'vitest';
import { ROUTE_SEO_REGISTRY } from '../../seo/domain/route-seo';
import {
  buildHeaderNav,
  filterNavEntries,
  NAV_ROUTES,
  type HeaderNavSourceEntry,
  type NavRouteEntry,
} from './route-registry';

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

  it("today's real NAV_ROUTES yields the brand link, all five live service routes (Slices 4+5), /el-salon (Slice 6a — inNav: true; /virginia stays out, inNav: false), /precios and /reservar (Slice 6b) and /contacto (footer's flat projection grows automatically, zero further edits — D7)", () => {
    expect(filterNavEntries(NAV_ROUTES).map((entry) => entry.path)).toEqual([
      '',
      'coloracion-vegetal-aveda',
      'mechas-babylights-balayage',
      'rastas',
      'extensiones-cabello-natural',
      'tratamientos-capilares',
      'el-salon',
      'precios',
      'reservar',
      'contacto',
    ]);
  });
});

describe('buildHeaderNav', () => {
  // A fixture registry with 2 of the 5 service routes live — mirrors the
  // real shape mid-rollout (Slices 4/5 flip these one at a time).
  const baseFixture: HeaderNavSourceEntry[] = [
    { path: '', breadcrumb: 'Inicio', planta: null, status: 'live', inNav: true },
    {
      path: 'coloracion-vegetal-aveda',
      breadcrumb: 'Coloración Vegetal',
      planta: 'romero',
      status: 'live',
      inNav: true,
    },
    {
      path: 'mechas-babylights-balayage',
      breadcrumb: 'Mechas de Autor',
      planta: 'espliego',
      status: 'live',
      inNav: true,
    },
    { path: 'rastas', breadcrumb: 'Rastas', planta: 'esparto', status: 'planned', inNav: true },
    {
      path: 'extensiones-cabello-natural',
      breadcrumb: 'Extensiones Naturales',
      planta: 'vid',
      status: 'planned',
      inNav: true,
    },
    {
      path: 'tratamientos-capilares',
      breadcrumb: 'Rituales Capilares',
      planta: 'olivo',
      status: 'planned',
      inNav: true,
    },
    { path: 'el-salon', breadcrumb: 'El Salón', planta: null, status: 'live', inNav: true },
    { path: 'reservar', breadcrumb: 'Reservar', planta: null, status: 'live', inNav: true },
    { path: 'contacto', breadcrumb: 'Contacto', planta: null, status: 'live', inNav: true },
  ];

  it('lists exactly the 2 live service routes in dropdownServices', () => {
    const result = buildHeaderNav(baseFixture);
    expect(result.dropdownServices.map((entry) => entry.path)).toEqual([
      'coloracion-vegetal-aveda',
      'mechas-babylights-balayage',
    ]);
  });

  it("flipping a live service route back to 'planned' removes it (D7 rollback property)", () => {
    const rolledBack = baseFixture.map((entry) =>
      entry.path === 'mechas-babylights-balayage'
        ? { ...entry, status: 'planned' as const }
        : entry,
    );
    const result = buildHeaderNav(rolledBack);
    expect(result.dropdownServices.map((entry) => entry.path)).toEqual([
      'coloracion-vegetal-aveda',
    ]);
  });

  it('keeps service routes and /reservar out of navLeft — they only appear in the dropdown/CTA zones', () => {
    const result = buildHeaderNav(baseFixture);
    const navLeftPaths = result.navLeft.map((entry) => entry.path);

    expect(navLeftPaths).toEqual(['el-salon', 'contacto']);
    expect(navLeftPaths).not.toContain('coloracion-vegetal-aveda');
    expect(navLeftPaths).not.toContain('reservar');
    expect(navLeftPaths).not.toContain('');
  });

  it('wordmark is always "Pureza", regardless of the home entry\'s breadcrumb', () => {
    const result = buildHeaderNav(baseFixture);
    expect(result.wordmark).toEqual({ path: '', label: 'Pureza', status: 'live', inNav: true });
  });

  it('reserveCta is undefined while /reservar is still planned, present once live', () => {
    const stillPlanned = buildHeaderNav(
      baseFixture.map((entry) =>
        entry.path === 'reservar' ? { ...entry, status: 'planned' as const } : entry,
      ),
    );
    expect(stillPlanned.reserveCta).toBeUndefined();

    const live = buildHeaderNav(baseFixture);
    expect(live.reserveCta).toEqual({
      path: 'reservar',
      label: 'Reservar',
      status: 'live',
      inNav: true,
    });
  });

  it("today's real ROUTE_SEO_REGISTRY yields all five live service routes in the dropdown (Slices 4+5 complete), /el-salon and /precios in navLeft (Slices 6a+6b) and a live reserveCta (/reservar live, Slice 6b)", () => {
    const result = buildHeaderNav(ROUTE_SEO_REGISTRY);
    expect(result.dropdownServices.map((entry) => entry.path)).toEqual([
      'coloracion-vegetal-aveda',
      'mechas-babylights-balayage',
      'rastas',
      'extensiones-cabello-natural',
      'tratamientos-capilares',
    ]);
    expect(result.reserveCta).toEqual({
      path: 'reservar',
      label: 'Reservar',
      status: 'live',
      inNav: true,
    });
    expect(result.navLeft.map((entry) => entry.path)).toEqual(['el-salon', 'precios', 'contacto']);
  });
});
