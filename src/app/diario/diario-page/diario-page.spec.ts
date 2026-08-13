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
import { POSTS_MANIFEST } from '../domain/post-manifest';

function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: MetadataPort, useClass: AngularMetadataAdapter },
      { provide: JsonLdPort, useClass: JsonLdAdapter },
    ],
  });
}

describe('DiarioPage (/diario) — diario spec', () => {
  it('renders through the shared layout shell (header + footer present)', async () => {
    configure();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/diario');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-header')).toBeTruthy();
    expect(el.querySelector('.site-footer')).toBeTruthy();
    expect(el.querySelector('app-diario-page')).toBeTruthy();
  });

  it('registry entry is "live" and its title/description/canonical are consumed unedited ("Live status")', async () => {
    const seo = getRouteSeo('diario');
    if (!seo) {
      throw new Error('route-seo.registry.json has no entry for "diario"');
    }
    expect(seo.status).toBe('live');

    configure();
    const document = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create('/diario');
    harness.detectChanges();

    expect(document.title).toBe(seo.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      seo.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl('diario'),
    );
  });

  it('neither <title> nor the H1 contains "Ciudad Real" — the registry description is exempt and MAY ("Title/H1 clean", "Description exempt")', async () => {
    const seo = getRouteSeo('diario');
    configure();
    const document = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create('/diario');
    harness.detectChanges();

    expect(document.title.toLowerCase()).not.toContain('ciudad real');

    const el = harness.routeNativeElement as HTMLElement;
    const h1 = el.querySelector('.diario-page__h1')?.textContent ?? '';
    expect(h1.toLowerCase()).not.toContain('ciudad real');

    // The registry description DOES contain it deliberately — exempt.
    expect(seo?.description.toLowerCase()).toContain('ciudad real');
  });

  it('lists exactly the three launch articles, each linking to /diario/:slug ("Index lists three articles")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/diario');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    const links = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('.diario-page__link'),
    ).map((a) => a.getAttribute('href'));

    expect(links).toHaveLength(3);
    expect(links.sort()).toEqual(
      POSTS_MANIFEST.map((post) => `/diario/${post.slug}`).sort(),
    );
  });

  it('emits BreadcrumbList JSON-LD and removes a stale HairSalon block', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const homeHarness = await RouterTestingHarness.create('/');
    homeHarness.detectChanges();
    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeTruthy();

    await homeHarness.navigateByUrl('/diario');
    homeHarness.detectChanges();

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();

    const breadcrumbNode = document.head.querySelector('script[data-pz-schema="breadcrumb"]');
    expect(breadcrumbNode).toBeTruthy();
    const breadcrumb = JSON.parse(breadcrumbNode?.textContent ?? '{}');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
  });
});
