import { Component, input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * The herbarium plate — the signature element (design.md §6). `specimen`
 * (the SVG illustration) and `photo` (a `pz-picture` usage) are BOTH
 * `input.required`: "illustration and photograph, never one alone" is
 * therefore a compile-time contract — a template omitting either input fails
 * to compile, not merely a review note.
 *
 * Non-interactive in this change: the service routes these plates would link
 * to don't exist yet. No click/link behaviour here — that's a future
 * "content" change concern.
 */
@Component({
  selector: 'pz-plate',
  imports: [NgTemplateOutlet],
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
}
