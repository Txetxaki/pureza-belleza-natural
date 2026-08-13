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
import { SERVICE_INDEX } from '../../services/domain/service-index';

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

  // REPLACED (Slice 7, not relaxed): all five service routes are now live
  // (Slices 4/5) — the old "no dead links to future routes" rule is now
  // wrong. Its inverse, and a stronger guard: the frieze/carta MUST link to
  // every one of them, AND every such link MUST resolve to a `status:
  // 'live'` registry entry (a route regressing to `'planned'` would fail
  // this test loudly instead of shipping a dead/premature link).
  it('links to all five live service routes from the hero frieze or the carta, each resolving to a live registry entry — home-page spec "Carta and frieze link to all five service routes"', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const hrefs = new Set(
      Array.from(el.querySelectorAll('a[href]')).map((a) => a.getAttribute('href') ?? ''),
    );

    expect(SERVICE_INDEX).toHaveLength(5);
    for (const entry of SERVICE_INDEX) {
      expect(hrefs.has(`/${entry.path}`)).toBe(true);
      expect(getRouteSeo(entry.path)?.status).toBe('live');
    }
  });

  it('reaches /el-salon, /precios and /reservar via the shared footer nav — home-page spec "Home route composition links to all five live service routes"', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MetadataPort, useClass: AngularMetadataAdapter },
        { provide: JsonLdPort, useClass: JsonLdAdapter },
      ],
    });

    // Full app shell (header + footer), same composition as the "layout
    // shell present" test above — the footer link row lives outside
    // HomePage's own route element.
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const footerHrefs = Array.from(el.querySelectorAll('.site-footer a[href]')).map(
      (a) => a.getAttribute('href') ?? '',
    );

    // /virginia is deliberately NOT asserted here: its registry entry
    // carries `inNav: false` by design, so `filterNavEntries` correctly
    // excludes it from the footer — it is now reachable via ONE tasteful
    // contextual link in the home quote attribution instead (see the
    // dedicated test below; content/08-diario's "orphan page" fix).
    // /diario is now live too (Slice 8) and IS in nav, so it belongs here.
    for (const path of ['el-salon', 'precios', 'reservar', 'diario']) {
      expect(footerHrefs).toContain(`/${path}`);
    }
  });

  it('links to /virginia from the quote attribution — content/08-diario fix for a genuine pre-existing orphan page (no other route linked there before)', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const link = el.querySelector<HTMLAnchorElement>('.home-quote__author-link');
    expect(link?.getAttribute('href')).toBe('/virginia');
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
