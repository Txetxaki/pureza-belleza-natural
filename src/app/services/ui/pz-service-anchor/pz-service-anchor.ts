import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { seoData } from '../../../seo/domain/route-seo';
import type { ServicePath } from '../../domain/service-index';

/**
 * Renders one link to a service route whose visible text IS
 * `seoData(path).primaryKeyword` verbatim — exact-match anchor text cannot
 * drift because it is derived, never typed twice (design.md File Changes;
 * diario spec "Anchor text matches target keyword"). First and only
 * consumer in this change: each launch article's single outbound link to
 * its paired service page (tasks.md 8.9).
 */
@Component({
  selector: 'pz-service-anchor',
  imports: [RouterLink],
  templateUrl: './pz-service-anchor.html',
})
export class PzServiceAnchor {
  readonly path = input.required<ServicePath>();

  protected readonly label = computed(() => {
    const keyword = seoData(this.path()).primaryKeyword;
    if (keyword === null) {
      throw new Error(`[pz-service-anchor] route "${this.path()}" has no primaryKeyword`);
    }
    return keyword;
  });
}
