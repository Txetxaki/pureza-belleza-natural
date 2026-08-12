import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { App } from '../app';
import { routes } from '../app.routes';
import { JsonLdPort, MetadataPort } from '../seo/domain/ports';
import { canonicalUrl, getRouteSeo } from '../seo/domain/route-seo';
import { AngularMetadataAdapter } from '../seo/infrastructure/angular-metadata.adapter';
import { JsonLdAdapter } from '../seo/infrastructure/json-ld.adapter';
import { SITE } from '../seo/domain/site';
import { STATIC_MAP_ASSET_AVAILABLE } from '../shared/ui/pz-static-map/pz-static-map';
import { buildTelUrl, buildWhatsAppUrl } from '../shared/utils/contact-links';

function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: MetadataPort, useClass: AngularMetadataAdapter },
      { provide: JsonLdPort, useClass: JsonLdAdapter },
    ],
  });
}

describe('ContactPage (/contacto) — routed through the real app.routes', () => {
  it('renders through the shared layout shell (header + footer present)', async () => {
    configure();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    // Client-side navigate the real app root to /contacto through the SAME
    // <router-outlet> the shell composes (App → pz-shell → router-outlet) —
    // exercises the exact SPA path a visitor takes from the header nav.
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/contacto');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-header')).toBeTruthy();
    expect(el.querySelector('.site-footer')).toBeTruthy();
    expect(el.querySelector('app-contact-page')).toBeTruthy();
  });

  it('presents the WhatsApp CTA first (primary) and the tel: CTA second (secondary) — contact-page spec "WhatsApp-first primary CTA"', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/contacto');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const ctas = Array.from(el.querySelectorAll('pz-cta a'));
    expect(ctas.length).toBeGreaterThanOrEqual(2);

    const [first, second] = ctas;
    expect(first.getAttribute('href')).toBe(buildWhatsAppUrl(SITE.telephone));
    expect(first.className).not.toContain('pz-cta--secondary');

    expect(second.getAttribute('href')).toBe(buildTelUrl(SITE.telephone));
    expect(second.className).toContain('pz-cta--secondary');
  });

  it('applies title/description/canonical from the route-seo registry entry for "contacto", and no primary keyword', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);
    const contactSeo = getRouteSeo('contacto');
    if (!contactSeo) {
      throw new Error('route-seo.registry.json has no entry for "contacto"');
    }
    expect(contactSeo.primaryKeyword).toBeNull();

    const harness = await RouterTestingHarness.create('/contacto');
    harness.detectChanges();

    expect(document.title).toBe(contactSeo.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      contactSeo.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl('contacto'),
    );
  });

  it('emits BreadcrumbList JSON-LD but NO HairSalon block (contact-page spec: no HairSalon on /contacto)', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const harness = await RouterTestingHarness.create('/contacto');
    harness.detectChanges();

    const breadcrumbNode = document.head.querySelector('script[data-pz-schema="breadcrumb"]');
    expect(breadcrumbNode).toBeTruthy();
    const breadcrumb = JSON.parse(breadcrumbNode?.textContent ?? '{}');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();
  });

  it('removes a stale HairSalon block left by "/" when navigated to client-side (SPA transition, not just a fresh prerendered load)', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();
    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeTruthy();

    await harness.navigateByUrl('/contacto');
    harness.detectChanges();

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();
  });

  it('shows no Maps iframe before interaction (degrades to the "Cómo llegar" fallback while task 4.8 stays blocked)', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/contacto');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('iframe')).toBeNull();

    if (!STATIC_MAP_ASSET_AVAILABLE) {
      const fallback = el.querySelector('.pz-static-map__fallback');
      expect(fallback?.textContent?.trim()).toBe('Cómo llegar');
      expect(fallback?.getAttribute('href')).toContain(encodeURIComponent(SITE.streetAddress));
    } else {
      expect(el.querySelector('.pz-static-map__button')).toBeTruthy();
    }
  });

  it('renders no contact form (no backend in this change)', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/contacto');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('form')).toBeNull();
  });
});
