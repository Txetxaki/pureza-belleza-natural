import { inject } from '@angular/core';
import { RedirectCommand, Router, type ResolveFn } from '@angular/router';
import type { RouteSeo } from '../../seo/domain/route-seo';
import { postManifestEntry } from './post-manifest';

/**
 * `/diario/:slug`'s route `resolve` (design.md D5) — merges the matched
 * slug's `posts.manifest.json` metadata into `route.snapshot.data['seo']`
 * so `SeoService.applyFromActivatedRoute` picks it up with ZERO `SeoService`
 * changes, exactly like a registry-backed route (seo-infrastructure spec,
 * "Title and canonical set on navigation"). Blog posts are deliberately
 * NOT in `route-seo.registry.json` (D6) — this resolver is what lets a
 * registry-less route still satisfy the same SEO contract.
 *
 * An unknown slug redirects to `/diario` via `RedirectCommand` (verified
 * present in the installed `@angular/ssr`/`@angular/router` 22.1.3, Engram
 * #2311) — no fallback branch, no thrown error mid-navigation.
 */
export const postSeoResolver: ResolveFn<RouteSeo | RedirectCommand> = (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  const entry = postManifestEntry(slug);

  if (!entry) {
    const router = inject(Router);
    return new RedirectCommand(router.parseUrl('/diario'));
  }

  return {
    path: `diario/${entry.slug}`,
    title: `${entry.title} | Pureza`,
    description: entry.description,
    // Informational/navigational content — no target keyword to defend
    // (same class as /el-salon, /contacto; diario spec doesn't assign one).
    primaryKeyword: null,
    breadcrumb: entry.title,
    planta: null,
    changefreq: 'monthly',
    priority: 0.6,
    inNav: false,
    status: 'live',
  };
};
