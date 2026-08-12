import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, type Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { canonicalUrl, type RouteSeo } from '../domain/route-seo';
import { JsonLdPort, MetadataPort } from '../domain/ports';
import { AngularMetadataAdapter } from '../infrastructure/angular-metadata.adapter';
import { JsonLdAdapter } from '../infrastructure/json-ld.adapter';
import { SeoService } from './seo.service';

@Component({ selector: 'pz-test-page', template: '' })
class TestPage {}

const HOME_SEO: RouteSeo = {
  path: '',
  title: 'Home Title',
  description: 'Home description text under budget.',
  primaryKeyword: 'peluquería sin químicos Ciudad Real',
  breadcrumb: 'Inicio',
  planta: null,
  changefreq: 'weekly',
  priority: 1,
  inNav: true,
  status: 'live',
};

const CONTACT_SEO: RouteSeo = {
  path: 'contacto',
  title: 'Contact Title',
  description: 'Contact description text under budget.',
  primaryKeyword: null,
  breadcrumb: 'Contacto',
  planta: null,
  changefreq: 'monthly',
  priority: 0.5,
  inNav: true,
  status: 'live',
};

const testRoutes: Routes = [
  { path: '', component: TestPage, data: { seo: HOME_SEO } },
  { path: 'contacto', component: TestPage, data: { seo: CONTACT_SEO } },
];

describe('SeoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        { provide: MetadataPort, useClass: AngularMetadataAdapter },
        { provide: JsonLdPort, useClass: JsonLdAdapter },
      ],
    });
  });

  it('sets title/description/canonical exactly once per navigation — no accumulation', async () => {
    // Injecting SeoService forces its constructor (router-event subscription)
    // to run before the harness's own navigation, mirroring app.config.ts's
    // provideAppInitializer wiring in production.
    TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);

    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();

    expect(document.title).toBe(HOME_SEO.title);
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      HOME_SEO.description,
    );
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl(''),
    );

    await harness.navigateByUrl('/contacto');
    harness.detectChanges();

    // Still exactly one of each node — the second navigation replaced the
    // values in place, it did not append a second title/meta/link.
    expect(document.title).toBe(CONTACT_SEO.title);
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      CONTACT_SEO.description,
    );
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl('contacto'),
    );
  });

  it('replaces the existing [data-pz-schema] node on re-navigation instead of duplicating it', async () => {
    const seoService = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);

    const harness = await RouterTestingHarness.create('/');
    harness.detectChanges();
    seoService.setJsonLd('hair-salon', { '@type': 'HairSalon', name: 'Pureza (first render)' });

    await harness.navigateByUrl('/contacto');
    harness.detectChanges();
    seoService.setJsonLd('hair-salon', { '@type': 'HairSalon', name: 'Pureza (second render)' });

    const nodes = document.querySelectorAll('script[data-pz-schema="hair-salon"]');
    expect(nodes).toHaveLength(1);
    expect(JSON.parse(nodes[0].textContent ?? '{}')).toEqual({
      '@type': 'HairSalon',
      name: 'Pureza (second render)',
    });
  });
});
