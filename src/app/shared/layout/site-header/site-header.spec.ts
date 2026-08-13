import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { POSTS_MANIFEST } from '../../../diario/domain/post-manifest';
import { ROUTE_SEO_REGISTRY } from '../../../seo/domain/route-seo';
import { buildHeaderNav } from '../route-registry';
import { SiteHeader } from './site-header';

// Both disclosures share the `header-disclosure__*` classes, so every query
// below goes through the panel id its trigger already declares in
// `aria-controls` — the same wiring a screen reader follows.
const TRIGGER = (panelId: string) => `.header-disclosure__trigger[aria-controls="${panelId}"]`;
const LINKS = (panelId: string) => `#${panelId} .header-disclosure__link`;

describe('SiteHeader', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      // Componentless catch-all: the active-state tests need `navigateByUrl`
      // to actually resolve, but the header reads only the URL — no real page
      // component has to exist for that.
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders the wordmark centred between the left nav and reserve-CTA zones (app-shell spec: "Wordmark centred")', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;

    const brand = el.querySelector('.site-header__brand');
    expect(brand?.textContent?.trim()).toBe('Pureza');
    expect(brand?.getAttribute('href')).toBe('/');

    // Structural centring: the header's three top-level children are the
    // left zone, the brand, then the right zone, in that DOM order — the
    // `1fr auto 1fr` grid (site-header.scss) places the middle one centred.
    const header = el.querySelector('.site-header');
    const children = Array.from(header?.children ?? []);
    expect(children[1]).toBe(brand);
  });

  it('never links to a /servicios index page — Carta items are exactly the live service routes, one link each (app-shell spec: "Dropdown links to five service routes, no index page")', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;

    const dropdownLinks = Array.from(el.querySelectorAll<HTMLAnchorElement>(LINKS('header-carta')));
    const expected = buildHeaderNav(ROUTE_SEO_REGISTRY).dropdownServices;

    expect(dropdownLinks).toHaveLength(expected.length);
    expect(dropdownLinks.every((a) => a.getAttribute('href') !== '/servicios')).toBe(true);
    expect(dropdownLinks.map((a) => a.getAttribute('href'))).toEqual(
      expected.map((entry) => `/${entry.path}`),
    );
  });

  it('toggles aria-expanded on the Carta trigger on click (Enter/Space activate a <button> the same way — native platform behavior, not a bespoke handler)', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>(TRIGGER('header-carta'));

    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    trigger?.click();
    fixture.detectChanges();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    trigger?.click();
    fixture.detectChanges();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes the panel and returns focus to the trigger', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>(TRIGGER('header-carta'));

    trigger?.click();
    fixture.detectChanges();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('exposes the panel/trigger ARIA wiring (aria-controls <-> id, aria-expanded present)', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>(TRIGGER('header-carta'));
    const panel = el.querySelector('.header-disclosure__panel');

    expect(trigger?.hasAttribute('aria-expanded')).toBe(true);
    expect(panel?.id).toBe('header-carta');
    expect(trigger?.getAttribute('aria-controls')).toBe(panel?.id);
  });

  it('renders the reserve CTA only once /reservar is live — no dead CTA link (registry-status-driven)', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const cta = el.querySelector('.site-header__cta');

    const reserveCta = buildHeaderNav(ROUTE_SEO_REGISTRY).reserveCta;
    expect(reserveCta).toEqual({
      path: 'reservar',
      label: 'Reservar',
      status: 'live',
      inNav: true,
    });
    expect(cta?.getAttribute('href')).toBe('/reservar');
    expect(cta?.textContent?.trim()).toBe('Reservar');
  });

  // ── Feedback round: the panel must not survive the navigation it caused ──

  it.each(['header-carta', 'header-diario'])(
    'closes %s when one of its own links is clicked — a router navigation neither reloads the DOM nor moves focus out, so nothing else would ever shut it',
    async (panelId) => {
      const fixture = await render();
      const el = fixture.nativeElement as HTMLElement;
      const trigger = el.querySelector<HTMLButtonElement>(TRIGGER(panelId));

      trigger?.click();
      fixture.detectChanges();
      expect(trigger?.getAttribute('aria-expanded')).toBe('true');

      el.querySelector<HTMLAnchorElement>(LINKS(panelId))?.click();
      fixture.detectChanges();

      expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    },
  );

  it('opens only one panel at a time — opening Diario shuts Carta', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const carta = el.querySelector<HTMLButtonElement>(TRIGGER('header-carta'));
    const diario = el.querySelector<HTMLButtonElement>(TRIGGER('header-diario'));

    carta?.click();
    fixture.detectChanges();
    expect(carta?.getAttribute('aria-expanded')).toBe('true');

    diario?.click();
    fixture.detectChanges();

    expect(diario?.getAttribute('aria-expanded')).toBe('true');
    expect(carta?.getAttribute('aria-expanded')).toBe('false');
  });

  // ── Feedback round: every page hangs off a parent, and shows it ──

  it('hangs every article off the Diario parent — the panel holds the index plus one link per manifest post, all namespaced under /diario', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;

    const hrefs = Array.from(el.querySelectorAll<HTMLAnchorElement>(LINKS('header-diario'))).map(
      (a) => a.getAttribute('href'),
    );

    expect(hrefs).toEqual([
      '/diario',
      ...POSTS_MANIFEST.map((post) => `/diario/${post.slug}`),
    ]);
  });

  it('marks the Carta trigger active while a service route is open — the state is "a child of mine is active", which no directive on the trigger itself can observe', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>(TRIGGER('header-carta'));
    const router = TestBed.inject(Router);

    expect(trigger?.classList.contains('is-active')).toBe(false);

    await router.navigateByUrl('/rastas');
    fixture.detectChanges();

    expect(trigger?.classList.contains('is-active')).toBe(true);
  });

  it('marks the Diario trigger active on an article, not just on the index', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>(TRIGGER('header-diario'));
    const router = TestBed.inject(Router);

    await router.navigateByUrl(`/diario/${POSTS_MANIFEST[0].slug}`);
    fixture.detectChanges();

    expect(trigger?.classList.contains('is-active')).toBe(true);
  });

  it('does not mark Diario active on a sibling route that merely shares its prefix', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>(TRIGGER('header-diario'));
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/diario-taller');
    fixture.detectChanges();

    expect(trigger?.classList.contains('is-active')).toBe(false);
  });
});
