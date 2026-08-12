import { canonicalUrl } from '../domain/route-seo';

export interface BreadcrumbItem {
  readonly name: string;
  /** Angular path, no leading slash. `''` is the home route. */
  readonly path: string;
}

/**
 * `@type: "BreadcrumbList"` — generic to any route (design.md §4/§7). Reuses
 * `canonicalUrl` for each item's `item` URL so the URL-join rule has exactly
 * one implementation (design.md risk E is about the TS/sitemap-script split,
 * not about this generator duplicating it too).
 */
export function buildBreadcrumbListSchema(items: readonly BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
