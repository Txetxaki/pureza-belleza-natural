import { Component, OnInit, inject, type Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '../../seo/application/seo.service';
import { buildBlogPostingSchema } from '../../seo/generators/blog-posting.schema';
import { postComponentFor, postManifestEntry } from '../domain/post-manifest';

/**
 * `/diario/:slug` — the shell (tasks.md 8.4, design.md D6): resolves the
 * post component by slug and renders it via `NgComponentOutlet` — content
 * present in the prerendered HTML, never `innerHTML`/an unsanitized string
 * (diario spec, "Content present without JS"). This is the ONE place
 * `BlogPosting` JSON-LD gets built, from the SAME `posts.manifest.json`
 * entry `post-seo.resolver.ts` already resolved by slug — the three body
 * components underneath stay pure prose with zero SEO wiring of their own,
 * the same "container owns JSON-LD, content owns copy" split every other
 * route in this app already follows (see rastas-page.ts vs its
 * `pzWhatIs`/`pzProcess` slots).
 *
 * By the time this component activates, `post-seo.resolver.ts` has already
 * redirected any unknown slug to `/diario` — the throws below are a
 * fail-fast guard against that invariant breaking, not an expected runtime
 * path (same "seoData()/serviceIndexEntry() throw, never render blank"
 * convention used throughout the domain layer).
 */
@Component({
  selector: 'app-post-page',
  imports: [NgComponentOutlet],
  templateUrl: './post-page.html',
  styleUrl: './post-page.scss',
})
export class PostPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  protected readonly component: Type<unknown>;

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const found = postComponentFor(slug);
    if (!found) {
      throw new Error(`[post-page] no POST_COMPONENTS entry for slug "${slug}"`);
    }
    this.component = found;
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const entry = postManifestEntry(slug);
    if (!entry) {
      throw new Error(`[post-page] no posts.manifest.json entry for slug "${slug}"`);
    }

    // Defensive removal on a client-side navigation from `/` — same gap
    // documented in contact-page.ts's ngOnInit.
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd(
      'blog-posting',
      buildBlogPostingSchema({
        slug: entry.slug,
        headline: entry.title,
        description: entry.description,
        datePublished: entry.publishedAt,
      }),
    );
  }
}
