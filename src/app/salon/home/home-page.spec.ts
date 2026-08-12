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
import { SeoService } from '../../seo/application/seo.service';

const FUTURE_ROUTE_PREFIXES = [
  '/coloracion-vegetal-aveda',
  '/mechas-babylights-balayage',
  '/rastas',
  '/extensiones-cabello-natural',
  '/tratamientos-capilares',
  '/virginia',
  '/el-salon',
  '/precios',
  '/reservar',
  '/diario',
];

describe('HomePage (/) — routed through the real app.routes', () => {
  function configure() {
    TestBed.configureTestingModule({
      providers: [
        // Real app.routes.ts wiring — the same table app.config.ts uses in
        // production, not a synthetic test-only route table.
        provideRouter(routes),
        { provide: MetadataPort, useClass: AngularMetadataAdapter },
        { provide: JsonLdPort, useClass: JsonLdAdapter },
      ],
    });
  }

  it('renders through the shared layout shell (header + footer present) — home-page spec "Layout shell present"', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MetadataPort, useClass: AngularMetadataAdapter },
        { provide: JsonLdPort, useClass: JsonLdAdapter },
      ],
    });

    // Renders the REAL app root (App → pz-shell → router-outlet), the same
    // composition production bootstraps, not a synthetic router-only host.
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-header')).toBeTruthy();
    expect(el.querySelector('.site-footer')).toBeTruthy();
    expect(el.querySelector('app-home-page')).toBeTruthy();
  });

  it('has no <a href> targeting any of the five future service routes, /virginia, /el-salon, /precios, /reservar, or /diario', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const hrefs = Array.from(el.querySelectorAll('a[href]')).map((a) => a.getAttribute('href') ?? '');

    for (const forbidden of FUTURE_ROUTE_PREFIXES) {
      expect(hrefs.some((href) => href === forbidden || href.startsWith(`${forbidden}/`))).toBe(false);
    }
  });

  it('applies title/description/canonical from the route-seo registry entry for "/"', async () => {
    configure();
    TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    const homeSeo = getRouteSeo('');
    if (!homeSeo) {
      throw new Error('route-seo.registry.json has no entry for ""');
    }

    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();

    expect(document.title).toBe(homeSeo.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      homeSeo.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl(''),
    );
  });

  it('emits HairSalon and BreadcrumbList JSON-LD (home-page spec: "SEO contract satisfied on /")', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();

    const hairSalonNode = document.head.querySelector('script[data-pz-schema="hair-salon"]');
    expect(hairSalonNode).toBeTruthy();
    const hairSalon = JSON.parse(hairSalonNode?.textContent ?? '{}');
    expect(hairSalon['@type']).toBe('HairSalon');

    const breadcrumbNode = document.head.querySelector('script[data-pz-schema="breadcrumb"]');
    expect(breadcrumbNode).toBeTruthy();
    const breadcrumb = JSON.parse(breadcrumbNode?.textContent ?? '{}');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(1);
    expect(breadcrumb.itemListElement[0].item).toBe(canonicalUrl(''));
  });

  it('has no eager Maps <iframe> in the initial render (home-page spec: "No eager map iframe")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('iframe')).toBeNull();
  });
});
