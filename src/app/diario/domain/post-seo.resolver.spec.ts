import { TestBed } from '@angular/core/testing';
import { RedirectCommand, provideRouter, Router, type ActivatedRouteSnapshot } from '@angular/router';
import { describe, expect, it } from 'vitest';
import type { RouteSeo } from '../../seo/domain/route-seo';
import { postManifestEntry } from './post-manifest';
import { postSeoResolver } from './post-seo.resolver';

function snapshotFor(slug: string): ActivatedRouteSnapshot {
  return { paramMap: { get: (key: string) => (key === 'slug' ? slug : null) } } as unknown as ActivatedRouteSnapshot;
}

describe('postSeoResolver (design.md D5; seo-infrastructure spec, "Title and canonical set on navigation")', () => {
  function configure() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  }

  it('resolves a RouteSeo-shaped object from the manifest entry for a known slug', () => {
    configure();
    const entry = postManifestEntry('rastas Ciudad Real' as never);
    expect(entry).toBeUndefined(); // sanity: fixture below uses a REAL slug

    const real = postManifestEntry('como-cuidar-rastas-para-que-duren');
    if (!real) {
      throw new Error('fixture slug missing from posts.manifest.json');
    }

    const result = TestBed.runInInjectionContext(() =>
      postSeoResolver(snapshotFor('como-cuidar-rastas-para-que-duren'), {} as never),
    ) as RouteSeo;

    expect(result).not.toBeInstanceOf(RedirectCommand);
    expect(result.path).toBe('diario/como-cuidar-rastas-para-que-duren');
    expect(result.title).toBe(`${real.title} | Pureza`);
    expect(result.description).toBe(real.description);
    expect(result.primaryKeyword).toBeNull();
    expect(result.planta).toBeNull();
    expect(result.status).toBe('live');
    expect(result.inNav).toBe(false);
  });

  it('redirects to /diario for an unknown slug — no thrown error mid-navigation', () => {
    configure();
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() =>
      postSeoResolver(snapshotFor('does-not-exist'), {} as never),
    );

    expect(result).toBeInstanceOf(RedirectCommand);
    expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/diario');
  });
});
