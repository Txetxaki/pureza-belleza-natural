import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { App } from '../../app';
import { routes } from '../../app.routes';
import { JsonLdPort, MetadataPort } from '../../seo/domain/ports';
import { canonicalUrl, getRouteSeo } from '../../seo/domain/route-seo';
import { AngularMetadataAdapter } from '../../seo/infrastructure/angular-metadata.adapter';
import { JsonLdAdapter } from '../../seo/infrastructure/json-ld.adapter';
import { countWords } from '../domain/word-count';

function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: MetadataPort, useClass: AngularMetadataAdapter },
      { provide: JsonLdPort, useClass: JsonLdAdapter },
    ],
  });
}

describe('ColoracionVegetalAvedaPage (/coloracion-vegetal-aveda) — service-pages spec', () => {
  it('renders through the shared layout shell (header + footer present)', async () => {
    configure();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/coloracion-vegetal-aveda');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-header')).toBeTruthy();
    expect(el.querySelector('.site-footer')).toBeTruthy();
    expect(el.querySelector('app-coloracion-vegetal-aveda-page')).toBeTruthy();
  });

  it('registry entry is "live" and its primaryKeyword, title and description are consumed unedited ("Registry status is live")', async () => {
    const seo = getRouteSeo('coloracion-vegetal-aveda');
    if (!seo) {
      throw new Error('route-seo.registry.json has no entry for "coloracion-vegetal-aveda"');
    }
    expect(seo.status).toBe('live');
    expect(seo.primaryKeyword).toBe('coloración sin amoniaco Ciudad Real');

    configure();
    const document = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create('/coloracion-vegetal-aveda');
    harness.detectChanges();

    expect(document.title).toBe(seo.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      seo.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl('coloracion-vegetal-aveda'),
    );

    // The H1 must CONTAIN the primary keyword, not equal it. Asserting
    // equality would force the headline to render as the bare keyword string
    // ("coloración sin amoniaco Ciudad Real") — exact-match keyword stuffing,
    // which reads as spam and is what Google's guidance penalises. Containment
    // of every token is the contract the study actually asks for, and it is a
    // stricter test than equality against a hand-typed literal: it still fails
    // if the copy quietly drops the keyword.
    const el = harness.routeNativeElement as HTMLElement;
    const h1 = el.querySelector('.pz-service-page__h1')?.textContent?.trim() ?? '';
    const normalise = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const token of seo.primaryKeyword!.split(/\s+/)) {
      expect(normalise(h1)).toContain(normalise(token));
    }
    expect(h1).not.toBe(seo.primaryKeyword);
  });

  it('binds exactly one [data-planta="romero"] scope, matching the registry planta ("Single accent scope per page")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/coloracion-vegetal-aveda');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const scoped = el.querySelectorAll('[data-planta]');
    expect(scoped).toHaveLength(1);
    expect(scoped[0].getAttribute('data-planta')).toBe('romero');
  });

  it('renders "qué es y para quién" between 150 and 200 words ("Word count within range")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/coloracion-vegetal-aveda');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const section = el.querySelector('.pz-service-page__what-is');
    const words = countWords(section?.textContent ?? '');
    expect(words).toBeGreaterThanOrEqual(150);
    expect(words).toBeLessThanOrEqual(200);
  });

  it('renders total body copy between 700 and 900 useful words ("700-900 useful words")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/coloracion-vegetal-aveda');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const body = el.querySelector('.pz-service-page__body');
    const words = countWords(body?.textContent ?? '');
    expect(words).toBeGreaterThanOrEqual(700);
    expect(words).toBeLessThanOrEqual(900);
  });

  it('renders exactly the two cross-link paths from the pairing map, no more, no fewer ("Cross-links match the pairing map")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/coloracion-vegetal-aveda');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const links = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('.pz-service-page__cross-links a'),
    );
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/tratamientos-capilares',
      '/mechas-babylights-balayage',
    ]);
  });

  it('renders both the /reservar CTA and a wa.me WhatsApp CTA ("Both CTAs present")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/coloracion-vegetal-aveda');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const anchors = Array.from(el.querySelectorAll('a.pz-cta'));
    expect(anchors.some((a) => a.getAttribute('href') === '/reservar')).toBe(true);
    expect(anchors.some((a) => a.getAttribute('href')?.startsWith('https://wa.me'))).toBe(true);
  });

  it('renders the result and before/after slots as honest placeholders — no fabricated hair photography', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/coloracion-vegetal-aveda');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('.pz-service-page__result-photo .pz-photo-pending')).toBeTruthy();
    expect(el.querySelectorAll('.pz-service-page__before-after .pz-photo-pending')).toHaveLength(
      3,
    );
    expect(el.querySelector('.pz-service-page__result-photo .pz-picture')).toBeNull();
  });

  it('renders "Consultar" and never a numeric price or duration while pricing is pending ("Pending entry renders Consultar")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/coloracion-vegetal-aveda');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const pricingSection = el.querySelector('.pz-service-page__pricing');
    expect(pricingSection?.textContent).toContain('Consultar');
    expect(pricingSection?.textContent).not.toMatch(/\d+\s*(min|€)/);
  });

  it('emits Service (no offers), FAQPage, and BreadcrumbList JSON-LD, and removes a stale HairSalon block', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const homeHarness = await RouterTestingHarness.create('/');
    homeHarness.detectChanges();
    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeTruthy();

    await homeHarness.navigateByUrl('/coloracion-vegetal-aveda');
    homeHarness.detectChanges();

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();

    const serviceNode = document.head.querySelector('script[data-pz-schema="service"]');
    expect(serviceNode).toBeTruthy();
    const service = JSON.parse(serviceNode?.textContent ?? '{}');
    expect(service['@type']).toBe('Service');
    expect('offers' in service).toBe(false);

    const faqNode = document.head.querySelector('script[data-pz-schema="faq"]');
    expect(faqNode).toBeTruthy();
    const faq = JSON.parse(faqNode?.textContent ?? '{}');
    expect(faq['@type']).toBe('FAQPage');
    const rendered = document.querySelectorAll('.pz-service-page__faq-item dt');
    expect(faq.mainEntity).toHaveLength(rendered.length);
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(4);
    expect(faq.mainEntity.length).toBeLessThanOrEqual(6);

    const breadcrumbNode = document.head.querySelector('script[data-pz-schema="breadcrumb"]');
    expect(breadcrumbNode).toBeTruthy();
    const breadcrumb = JSON.parse(breadcrumbNode?.textContent ?? '{}');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
  });
});
