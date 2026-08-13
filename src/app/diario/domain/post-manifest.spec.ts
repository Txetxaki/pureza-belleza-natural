import { describe, expect, it } from 'vitest';
import {
  POST_COMPONENTS,
  POST_SLUGS,
  POSTS_MANIFEST,
  postComponentFor,
  postManifestEntry,
} from './post-manifest';

describe('POSTS_MANIFEST / POST_COMPONENTS (diario spec, "Three prerendered posts"; design.md D6, bijection)', () => {
  it('has exactly three launch articles', () => {
    expect(POSTS_MANIFEST).toHaveLength(3);
  });

  it('every manifest slug has a matching POST_COMPONENTS entry — no orphan metadata', () => {
    for (const entry of POSTS_MANIFEST) {
      expect(POST_COMPONENTS[entry.slug]).toBeDefined();
    }
  });

  it('every POST_COMPONENTS key has a matching manifest entry — no orphan component (drift is caught)', () => {
    const manifestSlugs = new Set(POSTS_MANIFEST.map((entry) => entry.slug));
    for (const slug of Object.keys(POST_COMPONENTS)) {
      expect(manifestSlugs.has(slug)).toBe(true);
    }
  });

  it('POST_SLUGS matches the manifest slugs 1:1, in order', () => {
    expect(POST_SLUGS).toEqual(POSTS_MANIFEST.map((entry) => entry.slug));
  });

  it('every entry declares a non-empty title, description, standfirst and publishedAt', () => {
    for (const entry of POSTS_MANIFEST) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.standfirst.length).toBeGreaterThan(0);
      expect(entry.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('postManifestEntry returns the matching entry for a known slug', () => {
    expect(postManifestEntry('rastas Ciudad Real' as never)).toBeUndefined();
    expect(postManifestEntry('como-cuidar-rastas-para-que-duren')?.title).toContain('rastas');
  });

  it('postManifestEntry / postComponentFor return undefined (not throw) for an unknown slug', () => {
    expect(postManifestEntry('does-not-exist')).toBeUndefined();
    expect(postComponentFor('does-not-exist')).toBeUndefined();
  });

  it('postComponentFor returns a component for every real slug', () => {
    for (const slug of POST_SLUGS) {
      expect(postComponentFor(slug)).toBeDefined();
    }
  });
});
