import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { canonicalUrl, type RouteSeo } from '../domain/route-seo';
import { JsonLdPort, MetadataPort } from '../domain/ports';

/**
 * Applies `RouteSeo` (registry data) to the document. Subscribes to the
 * router itself (constructor) and reads the deepest activated route's
 * `data.seo` on every `NavigationEnd` — but only actually starts listening
 * once something forces this singleton to be constructed. `app.config.ts`
 * does that eagerly via `provideAppInitializer`, so a route can never ship
 * without its metadata being applied: page containers never call this
 * service directly (design.md §4).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly metadata = inject(MetadataPort);
  private readonly jsonLd = inject(JsonLdPort);
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.applyFromActivatedRoute());
  }

  private applyFromActivatedRoute(): void {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const seo = route.snapshot.data['seo'] as RouteSeo | undefined;
    if (seo) {
      this.apply(seo);
    }
  }

  /** Sets title, description, canonical, and OG/Twitter meta — upserts, never accumulates. */
  apply(seo: RouteSeo): void {
    const url = canonicalUrl(seo.path);
    this.metadata.setTitle(seo.title);
    this.metadata.setDescription(seo.description);
    this.metadata.setCanonical(url);
    this.metadata.setOpenGraph({ title: seo.title, description: seo.description, url });
    this.metadata.setTwitterCard({ title: seo.title, description: seo.description });
  }

  /** Upserts one `<script data-pz-schema="id">` — see `JsonLdPort` for the contract. */
  setJsonLd(id: string, schema: Record<string, unknown>): void {
    this.jsonLd.upsert(id, schema);
  }
}
