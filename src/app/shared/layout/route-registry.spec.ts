import { describe, expect, it } from 'vitest';
import { POSTS_MANIFEST } from '../../diario/domain/post-manifest';
import { ROUTE_SEO_REGISTRY } from '../../seo/domain/route-seo';
import {
  buildDiarioNav,
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

  it("today's real NAV_ROUTES yields the brand link and every other live route — /virginia included, since the feedback round flipped it inNav (it was reachable only by guessing the URL before that)", () => {
    expect(filterNavEntries(NAV_ROUTES).map((entry) => entry.path)).toEqual([
      '',
      'coloracion-vegetal-aveda',
      'mechas-babylights-balayage',
      'rastas',
      'extensiones-cabello-natural',
      'tratamientos-capilares',
      'virginia',
      'el-salon',
      'precios',
      'reservar',
      'contacto',
      'diario',
    ]);
  });

  it('leaves no live route orphaned — every live registry entry is reachable from the footer projection', () => {
    const live = NAV_ROUTES.filter((entry) => entry.status === 'live').map((entry) => entry.path);
    const reachable = filterNavEntries(NAV_ROUTES).map((entry) => entry.path);
    expect(reachable).toEqual(live);
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
    { path: 'diario', breadcrumb: 'Diario', planta: null, status: 'live', inNav: true },
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

  it('keeps service routes, /reservar and /diario out of navLeft — each already owns a zone, so leaving them here would render the label twice', () => {
    const result = buildHeaderNav(baseFixture);
    const navLeftPaths = result.navLeft.map((entry) => entry.path);

    expect(navLeftPaths).toEqual(['el-salon', 'contacto']);
    expect(navLeftPaths).not.toContain('coloracion-vegetal-aveda');
    expect(navLeftPaths).not.toContain('reservar');
    expect(navLeftPaths).not.toContain('diario');
    expect(navLeftPaths).not.toContain('');
  });

  it('diarioParent follows the same status/inNav rule as reserveCta — no dead trigger', () => {
    expect(buildHeaderNav(baseFixture).diarioParent).toEqual({
      path: 'diario',
      label: 'Diario',
      status: 'live',
      inNav: true,
    });

    const hidden = buildHeaderNav(
      baseFixture.map((entry) => (entry.path === 'diario' ? { ...entry, inNav: false } : entry)),
    );
    expect(hidden.diarioParent).toBeUndefined();
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

  it("today's real ROUTE_SEO_REGISTRY yields all five service routes in the Carta dropdown, /virginia /el-salon /precios /contacto in navLeft, and live diario/reserve zones", () => {
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
    expect(result.diarioParent).toEqual({
      path: 'diario',
      label: 'Diario',
      status: 'live',
      inNav: true,
    });
    expect(result.navLeft.map((entry) => entry.path)).toEqual([
      'virginia',
      'el-salon',
      'precios',
      'contacto',
    ]);
  });

  it('every live route reaches the header through exactly one zone — no orphans, no duplicates', () => {
    const result = buildHeaderNav(ROUTE_SEO_REGISTRY);
    const placed = [
      result.wordmark.path,
      ...result.navLeft.map((entry) => entry.path),
      ...result.dropdownServices.map((entry) => entry.path),
      ...(result.diarioParent ? [result.diarioParent.path] : []),
      ...(result.reserveCta ? [result.reserveCta.path] : []),
    ];
    const liveInNav = ROUTE_SEO_REGISTRY.filter(
      (entry) => entry.status === 'live' && entry.inNav,
    ).map((entry) => entry.path);

    expect(new Set(placed).size).toBe(placed.length);
    expect([...placed].sort()).toEqual([...liveInNav].sort());
  });
});

describe('buildDiarioNav', () => {
  it('namespaces every post under its parent — a post is reachable only as /diario/<slug>', () => {
    const result = buildDiarioNav([
      { slug: 'primera-entrada', title: 'Primera entrada' },
      { slug: 'segunda-entrada', title: 'Segunda entrada' },
    ]);

    expect(result).toEqual([
      { path: 'diario/primera-entrada', label: 'Primera entrada', status: 'live', inNav: true },
      { path: 'diario/segunda-entrada', label: 'Segunda entrada', status: 'live', inNav: true },
    ]);
  });

  it('projects the real manifest one-for-one, in manifest order', () => {
    expect(buildDiarioNav(POSTS_MANIFEST).map((entry) => entry.path)).toEqual(
      POSTS_MANIFEST.map((post) => `diario/${post.slug}`),
    );
  });
});
