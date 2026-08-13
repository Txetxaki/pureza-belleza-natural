// Tests `scripts/validate-keyword-uniqueness.mjs` directly (imported by
// relative path) rather than duplicating its logic into a second TS module —
// unlike `generate-image-variants.mjs` (which duplicates
// `image-variants.ts`'s naming rule because that script's OWN output is also
// consumed at Angular runtime), this validator's functions have no runtime
// consumer other than the prebuild gate itself, so one source of truth is
// both possible and preferable. Angular's vitest builder only discovers
// `src/**/*.spec.ts` (see the comment in `generate-image-variants.mjs`), so
// this spec lives under `src/app/seo/` even though the module under test is
// `scripts/validate-keyword-uniqueness.mjs`.
import { describe, expect, it } from 'vitest';
import {
  findBlogTitleLocalityViolations,
  findBlogTitleLengthViolations,
  BLOG_TITLE_SUFFIX,
  TITLE_MAX,
  findDuplicateKeywords,
  findDuplicatePaths,
  findDuplicatePlantas,
  findFieldViolations,
  hasViolations,
  normalizeKeyword,
  validateRegistry,
} from '../../../scripts/validate-keyword-uniqueness.mjs';

function route(overrides: Record<string, unknown> = {}) {
  return {
    path: 'ruta',
    title: 'Título válido',
    description: 'Descripción válida y suficientemente corta.',
    primaryKeyword: 'keyword única Ciudad Real',
    breadcrumb: 'Ruta',
    planta: null,
    changefreq: 'monthly',
    priority: 0.5,
    inNav: true,
    status: 'planned',
    ...overrides,
  };
}

describe('normalizeKeyword', () => {
  it('trims, lowercases, and collapses internal whitespace', () => {
    expect(normalizeKeyword('  Peluquería   Sin Químicos  ')).toBe('peluquería sin químicos');
  });

  it('returns null for null/undefined/empty input', () => {
    expect(normalizeKeyword(null)).toBeNull();
    expect(normalizeKeyword(undefined)).toBeNull();
    expect(normalizeKeyword('   ')).toBeNull();
  });
});

describe('findDuplicateKeywords', () => {
  it('passes when every non-null keyword is unique', () => {
    const routes = [
      route({ path: '', primaryKeyword: 'peluquería sin químicos Ciudad Real' }),
      route({ path: 'rastas', primaryKeyword: 'rastas Ciudad Real' }),
    ];
    expect(findDuplicateKeywords(routes)).toEqual([]);
  });

  it('fails when two routes share a normalized keyword', () => {
    const routes = [
      route({ path: 'a', primaryKeyword: 'rastas Ciudad Real' }),
      route({ path: 'b', primaryKeyword: '  RASTAS   ciudad real  ' }),
    ];
    const duplicates = findDuplicateKeywords(routes);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]).toMatchObject({ keyword: 'rastas ciudad real', paths: ['a', 'b'] });
  });

  it('exempts routes with a null/empty primary keyword (navigational routes)', () => {
    const routes = [
      route({ path: 'contacto', primaryKeyword: null }),
      route({ path: 'el-salon', primaryKeyword: null }),
    ];
    expect(findDuplicateKeywords(routes)).toEqual([]);
  });
});

describe('findDuplicatePaths', () => {
  it('passes when every path is unique', () => {
    expect(findDuplicatePaths([route({ path: 'a' }), route({ path: 'b' })])).toEqual([]);
  });

  it('fails when two entries share a path', () => {
    const duplicates = findDuplicatePaths([route({ path: 'a' }), route({ path: 'a' })]);
    expect(duplicates).toEqual([{ path: 'a' }]);
  });
});

describe('findDuplicatePlantas', () => {
  it('passes when each planta is claimed by at most one route', () => {
    const routes = [route({ path: 'a', planta: 'romero' }), route({ path: 'b', planta: 'esparto' })];
    expect(findDuplicatePlantas(routes)).toEqual([]);
  });

  it('fails when two routes claim the same planta', () => {
    const routes = [route({ path: 'a', planta: 'romero' }), route({ path: 'b', planta: 'romero' })];
    const duplicates = findDuplicatePlantas(routes);
    expect(duplicates).toEqual([{ planta: 'romero', paths: ['a', 'b'] }]);
  });

  it('exempts routes with no planta', () => {
    const routes = [route({ path: 'a', planta: null }), route({ path: 'b', planta: null })];
    expect(findDuplicatePlantas(routes)).toEqual([]);
  });
});

describe('findFieldViolations', () => {
  it('passes for a title/description/priority within budget', () => {
    expect(findFieldViolations([route()])).toEqual([]);
  });

  it('flags a title over 60 chars', () => {
    const violations = findFieldViolations([route({ title: 'x'.repeat(61) })]);
    expect(violations).toContainEqual(expect.objectContaining({ field: 'title' }));
  });

  it('flags a description over 155 chars', () => {
    const violations = findFieldViolations([route({ description: 'x'.repeat(156) })]);
    expect(violations).toContainEqual(expect.objectContaining({ field: 'description' }));
  });

  it('flags a priority outside 0..1', () => {
    const violations = findFieldViolations([route({ priority: 1.5 })]);
    expect(violations).toContainEqual(expect.objectContaining({ field: 'priority' }));
  });
});

function post(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'un-articulo',
    title: 'Un título sin la palabra prohibida',
    description: 'Descripción libre.',
    standfirst: 'Resumen libre.',
    publishedAt: '2026-06-15',
    ...overrides,
  };
}

describe('findBlogTitleLocalityViolations (diario spec, "Blog locality-term validator — title and H1 only")', () => {
  it('passes when no post title contains "Ciudad Real"', () => {
    expect(findBlogTitleLocalityViolations([post()])).toEqual([]);
  });

  it('flags a post title containing "Ciudad Real", accent/case-insensitive', () => {
    const violations = findBlogTitleLocalityViolations([
      post({ slug: 'malo', title: 'Peluquería en CIUDAD REAL, lo mejor' }),
    ]);
    expect(violations).toEqual([{ slug: 'malo', field: 'title', reason: 'contains "Ciudad Real"' }]);
  });

  it('never inspects description — a post description containing it is NOT flagged (title only)', () => {
    const violations = findBlogTitleLocalityViolations([
      post({ description: 'Consejos de peluquería en Ciudad Real.' }),
    ]);
    expect(violations).toEqual([]);
  });
});

describe('findBlogTitleLengthViolations (rendered <title> budget, not the raw manifest string)', () => {
  it('passes a title that still fits once the site suffix is appended', () => {
    const title = 'A'.repeat(TITLE_MAX - BLOG_TITLE_SUFFIX.length);
    expect(findBlogTitleLengthViolations([post({ title })])).toEqual([]);
  });

  it('flags a title that fits in the manifest but overflows once rendered', () => {
    // This is the exact failure mode that shipped: a manifest title comfortably
    // under TITLE_MAX whose rendered `<title>` (title + " | Pureza") exceeds it,
    // so it gets truncated in search results. Checking the raw string would miss it.
    const title = 'A'.repeat(TITLE_MAX - BLOG_TITLE_SUFFIX.length + 3);
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX);

    const violations = findBlogTitleLengthViolations([post({ slug: 'largo', title })]);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ slug: 'largo', field: 'title' });
    expect(violations[0].reason).toContain(String(title.length + BLOG_TITLE_SUFFIX.length));
  });
});

describe('validateRegistry + hasViolations', () => {
  it('reports no violations for a clean registry', () => {
    const routes = [
      route({ path: '', primaryKeyword: 'peluquería sin químicos Ciudad Real', planta: null }),
      route({ path: 'rastas', primaryKeyword: 'rastas Ciudad Real', planta: 'esparto' }),
    ];
    expect(hasViolations(validateRegistry(routes))).toBe(false);
  });

  it('reports violations for a registry with a duplicated keyword', () => {
    const routes = [
      route({ path: 'a', primaryKeyword: 'rastas Ciudad Real' }),
      route({ path: 'b', primaryKeyword: 'rastas Ciudad Real' }),
    ];
    expect(hasViolations(validateRegistry(routes))).toBe(true);
  });

  it('reports violations when a blog post title contains "Ciudad Real"', () => {
    const routes = [route({ path: '', primaryKeyword: null })];
    const posts = [post({ title: 'Peluquería en Ciudad Real, la mejor' })];
    expect(hasViolations(validateRegistry(routes, posts))).toBe(true);
  });

  it('defaults to no blog posts when the second argument is omitted (backward compatible)', () => {
    const routes = [route({ path: '', primaryKeyword: null })];
    expect(hasViolations(validateRegistry(routes))).toBe(false);
  });
});
