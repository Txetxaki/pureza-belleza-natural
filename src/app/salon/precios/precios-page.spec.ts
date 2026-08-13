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
import { SERVICE_INDEX } from '../../services/domain/service-index';

function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: MetadataPort, useClass: AngularMetadataAdapter },
      { provide: JsonLdPort, useClass: JsonLdAdapter },
    ],
  });
}

describe('PreciosPage (/precios) — precios-page spec', () => {
  it('renders through the shared layout shell (header + footer present)', async () => {
    configure();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/precios');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-header')).toBeTruthy();
    expect(el.querySelector('.site-footer')).toBeTruthy();
    expect(el.querySelector('app-precios-page')).toBeTruthy();
  });

  it('registry entry is "live" and its primaryKeyword/title/description/canonical are consumed unedited ("Metadata matches registry")', async () => {
    const seo = getRouteSeo('precios');
    if (!seo) {
      throw new Error('route-seo.registry.json has no entry for "precios"');
    }
    expect(seo.status).toBe('live');
    expect(seo.primaryKeyword).toBe('precios peluquería Ciudad Real');

    configure();
    const document = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create('/precios');
    harness.detectChanges();

    expect(document.title).toBe(seo.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      seo.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl('precios'),
    );

    // The H1 must CONTAIN the primary keyword, not equal it — same
    // site-wide convention established across the five service pages,
    // /virginia and /el-salon.
    const el = harness.routeNativeElement as HTMLElement;
    const h1 = el.querySelector('.precios-page__h1')?.textContent?.trim() ?? '';
    const normalise = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const token of seo.primaryKeyword!.split(/\s+/)) {
      expect(normalise(h1)).toContain(normalise(token));
    }
    expect(h1).not.toBe(seo.primaryKeyword);
    expect(h1).not.toBe('Hablemos de tu cabello');
  });

  it('renders exactly five sibling [data-planta] scopes, one per row, none nested ("Five sibling scopes present")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/precios');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const scoped = Array.from(el.querySelectorAll<HTMLElement>('[data-planta]'));
    expect(scoped).toHaveLength(5);
    expect(scoped.map((node) => node.getAttribute('data-planta')).sort()).toEqual(
      ['esparto', 'espliego', 'olivo', 'romero', 'vid'].sort(),
    );

    // None nested inside another [data-planta] scope.
    for (const node of scoped) {
      const ancestorScope = node.parentElement?.closest('[data-planta]');
      expect(ancestorScope).toBeNull();
    }
  });

  it('renders "Consultar" for every row and never a numeric price or duration ("No numeric price at launch")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/precios');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const rows = el.querySelectorAll('.precios-page__row');
    expect(rows).toHaveLength(5);
    for (const row of Array.from(rows)) {
      expect(row.textContent).toContain('Consultar');
      expect(row.querySelector('.precios-page__tariff-table')?.textContent).not.toMatch(
        /\d+\s*(min|€)/,
      );
    }
  });

  it('each row links to its matching live service route ("Row links resolve")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/precios');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const links = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('.precios-page__row-link'),
    ).map((a) => a.getAttribute('href'));

    expect(links).toEqual(SERVICE_INDEX.map((entry) => `/${entry.path}`));
    for (const entry of SERVICE_INDEX) {
      expect(getRouteSeo(entry.path)?.status).toBe('live');
    }
  });

  it('emits BreadcrumbList JSON-LD and removes a stale HairSalon block', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const homeHarness = await RouterTestingHarness.create('/');
    homeHarness.detectChanges();
    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeTruthy();

    await homeHarness.navigateByUrl('/precios');
    homeHarness.detectChanges();

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();

    const breadcrumbNode = document.head.querySelector('script[data-pz-schema="breadcrumb"]');
    expect(breadcrumbNode).toBeTruthy();
    const breadcrumb = JSON.parse(breadcrumbNode?.textContent ?? '{}');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
  });
});
