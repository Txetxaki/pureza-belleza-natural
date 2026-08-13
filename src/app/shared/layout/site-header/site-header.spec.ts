import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { ROUTE_SEO_REGISTRY } from '../../../seo/domain/route-seo';
import { buildHeaderNav } from '../route-registry';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([])],
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

  it('never links to a /servicios index page — dropdown items are exactly the live service routes, one link each (app-shell spec: "Dropdown links to five service routes, no index page")', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;

    const dropdownLinks = Array.from(el.querySelectorAll<HTMLAnchorElement>('.header-carta__link'));
    const expected = buildHeaderNav(ROUTE_SEO_REGISTRY).dropdownServices;

    // Today's real registry has zero live service routes yet (Slices 4/5
    // flip them) — this same assertion, unmodified, grows to 2/3/5 links as
    // those slices land, since it is driven by the same buildHeaderNav call
    // the component itself uses.
    expect(dropdownLinks).toHaveLength(expected.length);
    expect(dropdownLinks.every((a) => a.getAttribute('href') !== '/servicios')).toBe(true);
    expect(dropdownLinks.map((a) => a.getAttribute('href'))).toEqual(
      expected.map((entry) => `/${entry.path}`),
    );
  });

  it('toggles aria-expanded on the Carta trigger on click (Enter/Space activate a <button> the same way — native platform behavior, not a bespoke handler)', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>('.header-carta__trigger');

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
    const trigger = el.querySelector<HTMLButtonElement>('.header-carta__trigger');

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
    const trigger = el.querySelector<HTMLButtonElement>('.header-carta__trigger');
    const panel = el.querySelector('.header-carta__panel');

    expect(trigger?.hasAttribute('aria-expanded')).toBe(true);
    expect(panel?.id).toBe('header-carta');
    expect(trigger?.getAttribute('aria-controls')).toBe(panel?.id);
  });

  it('renders the reserve CTA only once /reservar is live — no dead CTA link (registry-status-driven)', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const cta = el.querySelector('.site-header__cta');

    // Today's real registry: /reservar is still 'planned' (Slice 6b flips
    // it live) — the CTA must not render a link to a route that doesn't
    // exist in app.routes.ts yet.
    expect(buildHeaderNav(ROUTE_SEO_REGISTRY).reserveCta).toBeUndefined();
    expect(cta).toBeNull();
  });
});
