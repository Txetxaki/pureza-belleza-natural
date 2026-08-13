// Tests `scripts/generate-sitemap.mjs`'s `pathToUrl` directly — see the
// comment in `validate-keyword-uniqueness.spec.ts` for why this lives under
// `src/app/seo/` (Angular's vitest builder only discovers `src/**/*.spec.ts`)
// and why it imports the script instead of duplicating its logic.
import { sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import postsData from '../diario/posts.manifest.json';
import registryData from './route-seo.registry.json';
import {
  BLOG_POST_CHANGEFREQ,
  BLOG_POST_PRIORITY,
  pathToUrl,
  selectSitemapEntries,
  type SitemapRegistryRouteLike,
} from '../../../scripts/generate-sitemap.mjs';

describe('pathToUrl', () => {
  it('maps the root directory to the site root URL', () => {
    expect(pathToUrl('')).toBe('https://purezabellezanatural.es/');
  });

  it('maps "." (relative() at the root) to the site root URL', () => {
    expect(pathToUrl('.')).toBe('https://purezabellezanatural.es/');
  });

  it('maps a top-level directory to its path URL, no trailing slash', () => {
    expect(pathToUrl('contacto')).toBe('https://purezabellezanatural.es/contacto');
  });

  it('normalizes the platform path separator (node:path sep) to a forward slash', () => {
    const relativeDir = ['diario', 'mi-post'].join(sep);
    expect(pathToUrl(relativeDir)).toBe('https://purezabellezanatural.es/diario/mi-post');
  });

  it('matches the canonicalUrl() rule in seo/domain/route-seo.ts (design risk E)', () => {
    // canonicalUrl('') === `${SITE.url}/` and canonicalUrl('contacto') ===
    // `${SITE.url}/contacto` — both scripts must derive identical URLs from
    // identical inputs; this is the manual half of that invariant (a real
    // cross-implementation Playwright assertion lands in PR5).
    expect(pathToUrl('')).toBe('https://purezabellezanatural.es/');
    expect(pathToUrl('contacto')).toBe('https://purezabellezanatural.es/contacto');
  });
});

function registryRow(overrides: Partial<SitemapRegistryRouteLike> = {}): SitemapRegistryRouteLike {
  return {
    path: '',
    changefreq: 'weekly',
    priority: 1,
    status: 'live',
    ...overrides,
  };
}

describe('selectSitemapEntries (seo-infrastructure spec, "Planned routes excluded", "Blog posts get a default priority")', () => {
  it('includes every built route whose registry entry is "live"', () => {
    const registry = [registryRow({ path: '', status: 'live' }), registryRow({ path: 'contacto', status: 'live' })];
    const { entries, warnings } = selectSitemapEntries(['', 'contacto'], registry, []);
    expect(entries.map((e) => e.loc).sort()).toEqual(
      ['https://purezabellezanatural.es/', 'https://purezabellezanatural.es/contacto'].sort(),
    );
    expect(warnings).toEqual([]);
  });

  it('excludes a built-but-"planned" registry route with a warning, not a throw ("Planned routes excluded")', () => {
    const registry = [registryRow({ path: '', status: 'live' }), registryRow({ path: 'diario', status: 'planned' })];
    const { entries, warnings } = selectSitemapEntries(['', 'diario'], registry, []);
    expect(entries.map((e) => e.loc)).toEqual(['https://purezabellezanatural.es/']);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('diario');
  });

  it('includes a blog post path with the documented default changefreq/priority, even with no registry entry ("Blog posts get a default priority")', () => {
    const registry = [registryRow({ path: '', status: 'live' })];
    const posts = [{ slug: 'mi-articulo' }];
    const { entries } = selectSitemapEntries(['', 'diario/mi-articulo'], registry, posts);

    const postEntry = entries.find((e) => e.loc.endsWith('/diario/mi-articulo'));
    expect(postEntry).toBeDefined();
    expect(postEntry?.changefreq).toBe(BLOG_POST_CHANGEFREQ);
    expect(postEntry?.priority).toBe(BLOG_POST_PRIORITY);
  });

  it('throws when a "live" registry route is missing from the built output', () => {
    const registry = [registryRow({ path: '', status: 'live' })];
    expect(() => selectSitemapEntries([], registry, [])).toThrow(/'live' route\(s\) missing/);
  });

  it('throws when a manifest blog post is missing from the built output', () => {
    const registry = [registryRow({ path: '', status: 'live' })];
    const posts = [{ slug: 'mi-articulo' }];
    expect(() => selectSitemapEntries([''], registry, posts)).toThrow(/blog post\(s\) missing/);
  });

  it('throws when a built path matches neither the registry nor the blog post manifest', () => {
    const registry = [registryRow({ path: '', status: 'live' })];
    expect(() => selectSitemapEntries(['', 'huerfano'], registry, [])).toThrow(/no route-seo\.registry\.json or posts\.manifest\.json entry/);
  });
});

// tasks.md Slice 9, task 9.3: "Final-state assertion: sitemap contains all
// 12 registry routes (all now 'live') + 3 blog-post paths = 15 <url>
// entries, zero 'planned' leakage." seo-infrastructure spec, "All twelve
// routes present and live" (full 12+3 count, superseding the earlier
// 2-route version of this assertion) + "Sitemap reflects prerendered
// output". Runs `selectSitemapEntries` against the REAL registry and blog
// manifest — not a fixture — so a `status` regression on any registry entry
// fails this test directly, the same drift-fails-a-test pattern the other
// bijection specs in this change use.
describe('selectSitemapEntries — final state (real route-seo.registry.json + posts.manifest.json)', () => {
  it('produces exactly 15 <url> entries (12 live registry routes + 3 blog posts) with zero exclusion warnings', () => {
    const registry = registryData as unknown as SitemapRegistryRouteLike[];
    const posts = postsData as ReadonlyArray<{ readonly slug: string }>;

    expect(registry).toHaveLength(12);
    expect(registry.every((entry) => entry.status === 'live')).toBe(true);
    expect(posts).toHaveLength(3);

    const builtRoutes = [
      ...registry.map((entry) => entry.path),
      ...posts.map((post) => `diario/${post.slug}`),
    ];

    const { entries, warnings } = selectSitemapEntries(builtRoutes, registry, posts);

    expect(entries).toHaveLength(15);
    expect(warnings).toEqual([]);

    const locs = entries.map((entry) => entry.loc);
    expect(new Set(locs).size).toBe(15);
    for (const post of posts) {
      expect(locs).toContain(`https://purezabellezanatural.es/diario/${post.slug}`);
    }
  });
});
