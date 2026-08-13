import { Component, input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * The herbarium plate — the signature element (design.md §6). `specimen`
 * (the SVG illustration) and `photo` (a `pz-picture` usage) are BOTH
 * `input.required`: "illustration and photograph, never one alone" is
 * therefore a compile-time contract — a template omitting either input fails
 * to compile, not merely a review note.
 *
 * `price` and `href` (design.md "Closing the four Stitch gaps" — row "Carta
 * price column", Slice 7) are BOTH optional, so no existing usage breaks by
 * default. `price` is a pre-formatted display string — `pz-plate` stays
 * presentational and learns nothing about the pricing domain, it never
 * receives a raw number or a `ServicePricing` object. `href` makes the title
 * a link (`RouterLink`) whose `::after` stretches over the whole `<article>`
 * (`position: relative` on the host), so the entire plate becomes the click
 * target while the accessibility tree still exposes exactly one link.
 */
@Component({
  selector: 'pz-plate',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './pz-plate.html',
  styleUrl: './pz-plate.scss',
})
export class PzPlate {
  /** `<ng-template>` containing the specimen SVG — `aria-hidden`, `stroke="currentColor"`. */
  readonly specimen = input.required<TemplateRef<unknown>>();
  // Duotone note (task 4.9): `photo` is a `pz-picture` usage supplied by the
  // caller. To render the sole hero-portrait exception inside a plate, the
  // caller passes `<pz-picture [duotone]="true" ...>` inside this template —
  // `pz-plate` itself stays untinted and needs no duotone input of its own.
  readonly photo = input.required<TemplateRef<unknown>>();

  readonly title = input<string>('');
  readonly latin = input<string>('');

  /** Pre-formatted price text (e.g. `formatFrom(pricingFor(path))`) — never a raw number. */
  readonly price = input<string | undefined>(undefined);
  /** Router path with leading slash (e.g. `'/' + path`). Omit to keep the plate non-interactive. */
  readonly href = input<string | undefined>(undefined);
}
