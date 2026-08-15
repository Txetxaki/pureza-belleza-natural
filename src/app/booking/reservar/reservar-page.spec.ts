import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { App } from '../../app';
import { routes } from '../../app.routes';
import { serverRoutes } from '../../app.routes.server';
import { JsonLdPort, MetadataPort } from '../../seo/domain/ports';
import { canonicalUrl, getRouteSeo } from '../../seo/domain/route-seo';
import { SITE } from '../../seo/domain/site';
import { AngularMetadataAdapter } from '../../seo/infrastructure/angular-metadata.adapter';
import { JsonLdAdapter } from '../../seo/infrastructure/json-ld.adapter';
import { EMBED_MAX_HEIGHT, EMBED_MIN_HEIGHT, embedHeightFromMessage } from './reservar-page';

const RESERVE_ORIGIN = new URL(SITE.bookingUrl).origin;
const heightMsg = (height: number) => ({
  type: 'reserve-embed:height',
  height,
});

describe('embedHeightFromMessage', () => {
  it('accepts a valid height from the booking origin', () => {
    expect(
      embedHeightFromMessage({ origin: RESERVE_ORIGIN, data: heightMsg(900) }, RESERVE_ORIGIN),
    ).toBe(900);
  });

  it('ignores a height from any other origin (the security check)', () => {
    expect(
      embedHeightFromMessage(
        { origin: 'https://evil.example', data: heightMsg(900) },
        RESERVE_ORIGIN,
      ),
    ).toBeNull();
  });

  it('ignores a message of the wrong type or a non-numeric height', () => {
    expect(
      embedHeightFromMessage(
        { origin: RESERVE_ORIGIN, data: { type: 'other', height: 900 } },
        RESERVE_ORIGIN,
      ),
    ).toBeNull();
    expect(
      embedHeightFromMessage({ origin: RESERVE_ORIGIN, data: heightMsg(NaN) }, RESERVE_ORIGIN),
    ).toBeNull();
  });

  it('clamps to the allowed band', () => {
    expect(
      embedHeightFromMessage({ origin: RESERVE_ORIGIN, data: heightMsg(99999) }, RESERVE_ORIGIN),
    ).toBe(EMBED_MAX_HEIGHT);
    expect(
      embedHeightFromMessage({ origin: RESERVE_ORIGIN, data: heightMsg(10) }, RESERVE_ORIGIN),
    ).toBe(EMBED_MIN_HEIGHT);
  });
});

function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: MetadataPort, useClass: AngularMetadataAdapter },
      { provide: JsonLdPort, useClass: JsonLdAdapter },
    ],
  });
}

describe('ReservarPage (/reservar) — reservar-page spec', () => {
  it('renders through the shared layout shell (header + footer present)', async () => {
    configure();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/reservar');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-header')).toBeTruthy();
    expect(el.querySelector('.site-footer')).toBeTruthy();
    expect(el.querySelector('app-reservar-page')).toBeTruthy();
  });

  it('registry entry is "live" and its primaryKeyword/title/description/canonical are consumed unedited ("Live status")', async () => {
    const seo = getRouteSeo('reservar');
    if (!seo) {
      throw new Error('route-seo.registry.json has no entry for "reservar"');
    }
    expect(seo.status).toBe('live');
    expect(seo.primaryKeyword).toBe('pedir cita peluquería Ciudad Real');

    configure();
    const document = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create('/reservar');
    harness.detectChanges();

    expect(document.title).toBe(seo.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      seo.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl('reservar'),
    );

    // The H1 must CONTAIN the primary keyword, not equal it — same
    // site-wide convention established across the five service pages,
    // /virginia and /el-salon.
    const el = harness.routeNativeElement as HTMLElement;
    const h1 = el.querySelector('.reservar-page__h1')?.textContent?.trim() ?? '';
    const normalise = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const token of seo.primaryKeyword!.split(/\s+/)) {
      expect(normalise(h1)).toContain(normalise(token));
    }
    expect(h1).not.toBe(seo.primaryKeyword);
  });

  it('shares no common keyword phrase with /contacto\'s H1 ("H1s do not overlap")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/reservar');
    harness.detectChanges();
    const reservarEl = harness.routeNativeElement as HTMLElement;
    const reservarH1 = reservarEl.querySelector('.reservar-page__h1')?.textContent?.trim() ?? '';

    await harness.navigateByUrl('/contacto');
    harness.detectChanges();
    const contactEl = harness.routeNativeElement as HTMLElement;
    const contactH1 = contactEl.querySelector('.contact-page__title')?.textContent?.trim() ?? '';

    expect(reservarH1.length).toBeGreaterThan(0);
    expect(contactH1.length).toBeGreaterThan(0);
    expect(reservarH1).not.toBe(contactH1);
    expect(reservarH1.toLowerCase()).not.toContain(contactH1.toLowerCase());
    expect(contactH1.toLowerCase()).not.toContain(reservarH1.toLowerCase());
  });

  it('does not duplicate /contacto\'s address, hours table or map ("No NAP/map duplication")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/reservar');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('address')).toBeNull();
    expect(el.querySelector('table')).toBeNull();
    expect(el.querySelector('.pz-static-map')).toBeNull();
    // The booking iframe is fine here — what this rule forbids is duplicating
    // /contacto's MAP, so only a maps iframe is disallowed.
    const iframes = Array.from(el.querySelectorAll('iframe'));
    expect(iframes.some((f) => /maps|google/i.test(f.getAttribute('src') ?? ''))).toBe(false);

    const contactLink = Array.from(el.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === '/contacto',
    );
    expect(contactLink).toBeTruthy();
  });

  // INVERTED: the old "No calendar widget" rule predated the booking system.
  // The owner explicitly asked for the calendar integrated, so the page now
  // embeds Boty Reserve's booking flow. The embed points at SITE.bookingUrl
  // and reserve's own frame-ancestors restricts who may frame it.
  it('embeds the booking calendar, pointed at the tenant booking URL', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/reservar');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const frame = el.querySelector('iframe');
    expect(frame).not.toBeNull();
    // Angular renders the sanitized SafeResourceUrl into the real src.
    expect(frame?.getAttribute('src')).toBe(SITE.bookingUrl);
    expect(frame?.getAttribute('title')).toContain('Pureza');
  });

  it('keeps WhatsApp and tel: as the conversational alternative', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/reservar');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const anchors = Array.from(el.querySelectorAll('a.pz-cta'));

    expect(anchors.some((a) => a.getAttribute('href')?.startsWith('https://wa.me'))).toBe(true);
    expect(anchors.some((a) => a.getAttribute('href')?.startsWith('tel:'))).toBe(true);
  });

  it('never claims booking is WhatsApp-only, now that the booking page exists', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/reservar');
    harness.detectChanges();

    const text = (harness.routeNativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toMatch(/no hay un calendario online/i);
  });

  it('declares RenderMode.Prerender for "reservar" in app.routes.server.ts, not Server ("Prerender render mode")', () => {
    const entry = serverRoutes.find((route) => route.path === 'reservar');
    expect(entry).toBeTruthy();
    // RenderMode.Prerender === 1 in @angular/ssr; assert by reference to the
    // same enum value the other routes use, not a hardcoded number.
    expect(entry?.renderMode).toBe(serverRoutes.find((route) => route.path === '')?.renderMode);
  });

  it('emits BreadcrumbList JSON-LD and removes a stale HairSalon block', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const homeHarness = await RouterTestingHarness.create('/');
    homeHarness.detectChanges();
    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeTruthy();

    await homeHarness.navigateByUrl('/reservar');
    homeHarness.detectChanges();

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();

    const breadcrumbNode = document.head.querySelector('script[data-pz-schema="breadcrumb"]');
    expect(breadcrumbNode).toBeTruthy();
    const breadcrumb = JSON.parse(breadcrumbNode?.textContent ?? '{}');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
  });
});
