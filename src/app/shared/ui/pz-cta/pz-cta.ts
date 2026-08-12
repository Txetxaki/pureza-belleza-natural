import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Primary/secondary CTA button. Neutral ink style, no plant accent — CTAs
 * are brand-neutral by decision (design.md; #2289). `--pz-radius` (2px), no
 * drop shadow, matching the rest of the token system (§1: "no elevation").
 *
 * Renders an `<a>` when `href` is set (internal `routerLink` or an external
 * URL like `tel:`/`wa.me`), otherwise a `<button type="button">`.
 */
@Component({
  selector: 'pz-cta',
  imports: [RouterLink],
  templateUrl: './pz-cta.html',
  styleUrl: './pz-cta.scss',
})
export class PzCta {
  readonly variant = input<'primary' | 'secondary'>('primary');
  readonly href = input<string | undefined>(undefined);
  /** External links (tel:, wa.me, maps) open safely; internal routes never need this. */
  readonly external = input(false);
}
