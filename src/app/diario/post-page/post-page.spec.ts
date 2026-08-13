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

describe('PostPage (/diario/:slug) — diario spec', () => {
  it.each(POSTS_MANIFEST)(
    'renders "$slug" through the shared shell with its full article text present (no innerHTML, "Content present without JS")',
    async (post) => {
      configure();
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      await fixture.whenStable();

      const router = TestBed.inject(Router);
      await router.navigateByUrl(`/diario/${post.slug}`);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.site-header')).toBeTruthy();
      expect(el.querySelector('.site-footer')).toBeTruthy();

      const article = el.querySelector('.pz-article');
      expect(article).toBeTruthy();
      expect(article?.querySelector('h1')?.textContent?.trim().length).toBeGreaterThan(0);
      expect((article?.textContent ?? '').length).toBeGreaterThan(400);
    },
  );

  it.each(POSTS_MANIFEST)(
    '"$slug": neither <title> nor the H1 contains "Ciudad Real" ("Title/H1 clean")',
    async (post) => {
      const seo = getRouteSeo('diario');
      configure();
      const document = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create(`/diario/${post.slug}`);
      harness.detectChanges();

      expect(document.title.toLowerCase()).not.toContain('ciudad real');

      const el = harness.routeNativeElement as HTMLElement;
      const h1 = el.querySelector('h1')?.textContent ?? '';
      expect(h1.toLowerCase()).not.toContain('ciudad real');
      // sanity: the registry's own /diario description is allowed to and does
      // contain it — this test is about title/H1 only, not description.
      expect(seo?.description.toLowerCase()).toContain('ciudad real');
    },
  );

  it('sets title/canonical from the manifest entry via the route resolve, and BlogPosting JSON-LD authored by the stable Person @id', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);
    const post = POSTS_MANIFEST[0];
    const harness = await RouterTestingHarness.create(`/diario/${post.slug}`);
    harness.detectChanges();

    expect(document.title).toBe(`${post.title} | Pureza`);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      post.description,
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl(`diario/${post.slug}`),
    );

    const node = document.head.querySelector('script[data-pz-schema="blog-posting"]');
    expect(node).toBeTruthy();
    const schema = JSON.parse(node?.textContent ?? '{}');
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema['headline']).toBe(post.title);
    expect(schema['datePublished']).toBe(post.publishedAt);
    expect(schema['author']).toEqual({ '@id': SCHEMA_ID.person });
  });

  it('removes a stale HairSalon block on client-side navigation from /', async () => {
    configure();
    const document = TestBed.inject(DOCUMENT);
    const post = POSTS_MANIFEST[0];

    const homeHarness = await RouterTestingHarness.create('/');
    homeHarness.detectChanges();
    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeTruthy();

    await homeHarness.navigateByUrl(`/diario/${post.slug}`);
    homeHarness.detectChanges();

    expect(document.head.querySelector('script[data-pz-schema="hair-salon"]')).toBeNull();
  });

  it('redirects an unknown slug to /diario', async () => {
    configure();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/diario/does-not-exist');
    expect(router.url).toBe('/diario');
  });

  it.each([
    ['cuanto-dura-coloracion-sin-amoniaco', 'coloracion-vegetal-aveda'],
    ['como-cuidar-rastas-para-que-duren', 'rastas'],
    ['babylights-o-balayage-diferencias', 'mechas-babylights-balayage'],
  ] as const)(
    '"%s" links exactly once to /%s, anchor text equal to its exact primaryKeyword ("Anchor text matches target keyword")',
    async (slug, targetPath) => {
      configure();
      const harness = await RouterTestingHarness.create(`/diario/${slug}`);
      harness.detectChanges();

      const el = harness.routeNativeElement as HTMLElement;
      const anchors = Array.from(
        el.querySelectorAll<HTMLAnchorElement>(`a[href="/${targetPath}"]`),
      );
      expect(anchors).toHaveLength(1);
      expect(anchors[0].textContent).toBe(getRouteSeo(targetPath)?.primaryKeyword);
    },
  );
});
