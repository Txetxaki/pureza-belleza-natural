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

function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: MetadataPort, useClass: AngularMetadataAdapter },
      { provide: JsonLdPort, useClass: JsonLdAdapter },
    ],
  });
}

describe('ElSalonPage (/el-salon) — salon-page spec', () => {
  it('renders through the shared layout shell (header + footer present)', async () => {
    configure();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/el-salon');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-header')).toBeTruthy();
    expect(el.querySelector('.site-footer')).toBeTruthy();
    expect(el.querySelector('app-el-salon-page')).toBeTruthy();
  });

  it('registry entry is "live", has a null primaryKeyword ("Exempt from uniqueness check"), and applies title/description/canonical unedited', async () => {
    const seo = getRouteSeo('el-salon');
    if (!seo) {
      throw new Error('route-seo.registry.json has no entry for "el-salon"');
    }
    expect(seo.status).toBe('live');
    expect(seo.primaryKeyword).toBeNull();

    configure();
    const document = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create('/el-salon');
    harness.detectChanges();

    expect(document.title).toBe(seo.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      seo.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl('el-salon'),
    );
  });

  it('renders exactly one honest interior placeholder, labelled as pending, not a broken image ("One honest placeholder, no fabricated interior")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/el-salon');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const placeholders = el.querySelectorAll('.pz-photo-pending');
    expect(placeholders).toHaveLength(1);
    expect(placeholders[0].textContent).toContain('Foto pendiente de la sesión');
    expect(placeholders[0].getAttribute('role')).toBe('img');
  });

  it('uses only atmosfera-* botanical imagery for its non-interior photography — no fabricated interior/people imagery, no stock', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/el-salon');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const pictures = Array.from(el.querySelectorAll('pz-picture'));
    expect(pictures.length).toBeGreaterThan(0);
    for (const picture of pictures) {
      const src = picture.querySelector('img')?.getAttribute('src') ?? '';
      expect(src).toContain('atmosfera-');
    }
  });

  it('carries no [data-planta] accent scope — planta: null, neutral trust page', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/el-salon');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-planta]')).toHaveLength(0);
  });

  it('links to /contacto for hours/address/map instead of duplicating them (anti-cannibalization)', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/el-salon');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    // /contacto owns the hours table and NAP block — /el-salon must not
    // render its own copy of either.
    expect(el.querySelector('table')).toBeNull();
    expect(el.querySelector('address')).toBeNull();

    const contactLink = Array.from(el.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === '/contacto',
    );
    expect(contactLink).toBeTruthy();
  });

  it('does not repeat /virginia\'s or /contacto\'s H1 — unique site-wide', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/el-salon');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const h1 = el.querySelector('.el-salon-page__h1')?.textContent?.trim() ?? '';
    expect(h1.length).toBeGreaterThan(0);
    expect(h1).not.toBe('Hablemos de tu cabello');
    expect(h1).not.toContain('Virginia peluquera Ciudad Real');
  });

  it('emits BreadcrumbList JSON-LD and removes a stale HairSalon block', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const homeHarness = await RouterTestingHarness.create('/');
    homeHarness.detectChanges();
    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeTruthy();

    await homeHarness.navigateByUrl('/el-salon');
    homeHarness.detectChanges();

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();

    const breadcrumbNode = document.head.querySelector('script[data-pz-schema="breadcrumb"]');
    expect(breadcrumbNode).toBeTruthy();
    const breadcrumb = JSON.parse(breadcrumbNode?.textContent ?? '{}');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
  });
});
