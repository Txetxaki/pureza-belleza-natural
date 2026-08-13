import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PzCta } from '../../../shared/ui/pz-cta/pz-cta';
import { PzPhotoPending } from '../../../shared/ui/pz-photo-pending/pz-photo-pending';
import { PzSpecimen } from '../../../shared/ui/pz-specimen/pz-specimen';
import { buildWhatsAppUrl } from '../../../shared/utils/contact-links';
import { SITE } from '../../../seo/domain/site';
import type { FaqEntry } from '../../../seo/generators/faq-page.schema';
import { formatDuration, formatFrom, type ServicePricing } from '../../domain/pricing';
import { serviceIndexEntry, type ServicePath } from '../../domain/service-index';

/**
 * One `base`/`alt` pair for `pz-photo-pending` (design.md D9). `width`/
 * `height` are NOT part of this shape — they are structural (design.md's
 * stable placeholder dimensions: `resultado-{planta}` 1200×800,
 * `antes-despues-{planta}-{n}` 800×800), fixed by the layout itself so every
 * service page ships the identical aspect ratio regardless of caller input.
 */
export interface ServicePhoto {
  readonly base: string;
  readonly alt: string;
}

/**
 * The typed contract every service-route container (Slice 4/5) supplies to
 * this layout (design.md D1). `path` is the ONLY source `planta` is derived
 * from (D2) — never pass a `planta` directly, so the accent scope can never
 * disagree with the registry. `faq` MUST be the exact same array reference
 * the container also hands to `buildFaqPageSchema` — Angular's `input()`
 * binds by reference, so passing the same variable to both call sites is
 * enough to guarantee the rendered questions and the FAQPage JSON-LD can
 * never drift apart (service-pages spec, "FAQ count and schema match").
 */
export interface ServiceContent {
  readonly path: ServicePath;
  /** Anatomy item 1 — carries the registry `primaryKeyword`. */
  readonly h1: string;
  /** Anatomy item 1's value-proposition line. */
  readonly valueProp: string;
  /** Italic accent binomial under the H1 (Stitch reading, item 4). */
  readonly latinBinomial: string;
  /** Anatomy item 2 — real photo of the result. */
  readonly resultPhoto: ServicePhoto;
  /** Anatomy item 6 — before/after, minimum three cases. */
  readonly beforeAfter: readonly [ServicePhoto, ServicePhoto, ServicePhoto];
  /** Anatomy item 5. */
  readonly pricing: ServicePricing;
  /** Anatomy item 7 — 4-6 entries. */
  readonly faq: readonly FaqEntry[];
  /** Anatomy item 9 — exactly two, per the study's pairing map. */
  readonly crossLinks: readonly [ServicePath, ServicePath];
}

/** design.md "Stable placeholder filenames" — fixed by the layout, not the caller. */
const RESULT_PHOTO_WIDTH = 1200;
const RESULT_PHOTO_HEIGHT = 800;
const BEFORE_AFTER_WIDTH = 800;
const BEFORE_AFTER_HEIGHT = 800;

/**
 * The one presentational layout rendering all nine service-page anatomy
 * parts in fixed order (design.md D1; service-pages spec "Nine-part anatomy
 * in fixed order"). Five thin route containers (Slice 4/5) pass a typed
 * `ServiceContent` and project the two prose sections via named
 * `<ng-content>` slots (`[pzWhatIs]` / `[pzProcess]`) — order stays
 * structural, copy stays authorable, never `innerHTML` (D1 hybrid).
 */
@Component({
  selector: 'pz-service-page',
  imports: [RouterLink, PzCta, PzPhotoPending, PzSpecimen],
  templateUrl: './pz-service-page.html',
  styleUrl: './pz-service-page.scss',
  host: {
    // The SOLE accent scope for the entire subtree (design.md D2) — derived
    // from the registry via content().path, never a free input, so "one
    // accent per service route, never nested" is a construction guarantee.
    '[attr.data-planta]': 'planta()',
  },
})
export class PzServicePage {
  readonly content = input.required<ServiceContent>();

  protected readonly planta = computed(() => serviceIndexEntry(this.content().path).planta);

  /** "Coloración Vegetal · romero" — registry-derived (breadcrumb + planta),
   * closes the Stitch eyebrow gap (BRIEF §3, item 2) with zero duplicated
   * per-page input; `.pz-eyebrow`'s CSS uppercases it for display. */
  protected readonly eyebrow = computed(
    () => `${serviceIndexEntry(this.content().path).breadcrumb} · ${this.planta()}`,
  );

  protected readonly serviceBreadcrumb = computed(
    () => serviceIndexEntry(this.content().path).breadcrumb,
  );

  protected readonly whatsappUrl = computed(() => buildWhatsAppUrl(SITE.telephone));

  /** "Consultar" while pending (pricing.ts) — never a fabricated figure. */
  protected readonly fromLabel = computed(() => formatFrom(this.content().pricing));
  protected readonly durationLabel = computed(() => formatDuration(this.content().pricing));

  protected readonly resultPhotoWidth = RESULT_PHOTO_WIDTH;
  protected readonly resultPhotoHeight = RESULT_PHOTO_HEIGHT;
  protected readonly beforeAfterWidth = BEFORE_AFTER_WIDTH;
  protected readonly beforeAfterHeight = BEFORE_AFTER_HEIGHT;

  /** Anchor text for anatomy item 9 — the paired route's registry breadcrumb. */
  protected crossLinkLabel(path: ServicePath): string {
    return serviceIndexEntry(path).breadcrumb;
  }
}
