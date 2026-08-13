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
import { SCHEMA_ID } from '../../seo/domain/schema-ids';
import { buildPersonSchema } from '../../seo/generators/person.schema';

function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: MetadataPort, useClass: AngularMetadataAdapter },
      { provide: JsonLdPort, useClass: JsonLdAdapter },
    ],
  });
}

describe('VirginiaPage (/virginia) — virginia-page spec', () => {
  it('renders through the shared layout shell (header + footer present)', async () => {
    configure();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/virginia');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-header')).toBeTruthy();
    expect(el.querySelector('.site-footer')).toBeTruthy();
    expect(el.querySelector('app-virginia-page')).toBeTruthy();
  });

  it('registry entry is "live" and its primaryKeyword/title/description/canonical are consumed unedited ("Live status")', async () => {
    const seo = getRouteSeo('virginia');
    if (!seo) {
      throw new Error('route-seo.registry.json has no entry for "virginia"');
    }
    expect(seo.status).toBe('live');
    expect(seo.primaryKeyword).toBe('Virginia peluquera Ciudad Real');

    configure();
    const document = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create('/virginia');
    harness.detectChanges();

    expect(document.title).toBe(seo.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      seo.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl('virginia'),
    );

    // The H1 must CONTAIN the primary keyword, not equal it — same
    // convention established across the five service pages.
    const el = harness.routeNativeElement as HTMLElement;
    const h1 = el.querySelector('.virginia-page__h1')?.textContent?.trim() ?? '';
    const normalise = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const token of seo.primaryKeyword!.split(/\s+/)) {
      expect(normalise(h1)).toContain(normalise(token));
    }
    expect(h1).not.toBe(seo.primaryKeyword);
  });

  it('carries no [data-planta] accent scope anywhere in the subtree ("Neutral, no accent scope")', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/virginia');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-planta]')).toHaveLength(0);
  });

  it('presents experience/credentials content, not just a photo and a name', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/virginia');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('.pz-picture')).toBeTruthy();
    const sections = el.querySelectorAll('.virginia-page__section');
    expect(sections.length).toBeGreaterThanOrEqual(3);
  });

  it('renders the real Virginia portrait untinted — the duotone treatment is reserved for the home hero only', async () => {
    configure();
    const harness = await RouterTestingHarness.create('/virginia');
    harness.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('.pz-picture--duotone')).toBeNull();
  });

  it('emits Person JSON-LD with a stable @id referencing the HairSalon @id, plus BreadcrumbList, and removes a stale HairSalon block ("Person @id is stable and referenced")', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);

    const homeHarness = await RouterTestingHarness.create('/');
    homeHarness.detectChanges();
    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeTruthy();

    await homeHarness.navigateByUrl('/virginia');
    homeHarness.detectChanges();

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();

    const personNode = document.head.querySelector('script[data-pz-schema="person"]');
    expect(personNode).toBeTruthy();
    const person = JSON.parse(personNode?.textContent ?? '{}');
    expect(person['@type']).toBe('Person');
    expect(person['@id']).toBe(SCHEMA_ID.person);
    expect(person['@id']).toBe(buildPersonSchema()['@id']);
    expect(person['worksFor']).toEqual({ '@id': SCHEMA_ID.salon });

    const breadcrumbNode = document.head.querySelector('script[data-pz-schema="breadcrumb"]');
    expect(breadcrumbNode).toBeTruthy();
    const breadcrumb = JSON.parse(breadcrumbNode?.textContent ?? '{}');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
  });
});
