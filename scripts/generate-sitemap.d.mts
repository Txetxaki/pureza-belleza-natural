// Hand-written declaration file for generate-sitemap.mjs — lets
// src/app/seo/generate-sitemap.spec.ts import the plain-ESM script directly
// with real types (same pattern as validate-keyword-uniqueness.d.mts).
export declare function pathToUrl(relativeDir: string): string;

export declare const BLOG_POST_CHANGEFREQ: string;
export declare const BLOG_POST_PRIORITY: number;

export interface SitemapRegistryRouteLike {
  readonly path: string;
  readonly status: 'live' | 'planned';
  readonly changefreq: 'weekly' | 'monthly' | 'yearly';
  readonly priority: number;
}

export interface SitemapPostLike {
  readonly slug: string;
}

export interface SitemapEntry {
  readonly loc: string;
  readonly changefreq: string;
  readonly priority: number;
}

export interface SitemapSelection {
  readonly entries: SitemapEntry[];
  readonly warnings: string[];
}

export declare function selectSitemapEntries(
  builtRoutes: readonly string[],
  registry: readonly SitemapRegistryRouteLike[],
  posts: readonly SitemapPostLike[],
): SitemapSelection;
