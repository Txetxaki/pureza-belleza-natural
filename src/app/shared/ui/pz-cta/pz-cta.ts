import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Primary/secondary CTA button. Neutral ink style, no plant accent by
 * default — CTAs are brand-neutral by decision (design.md; #2289).
 * `--pz-radius` (2px), no drop shadow, matching the rest of the token system
 * (§1: "no elevation").
 *
 * Renders an `<a>` when `href` is set (internal `routerLink` or an external
 * URL like `tel:`/`wa.me`), otherwise a `<button type="button">`.
 *
 * `accent` (design.md D8, Engram #2311) narrows #2289 for service routes
 * only: when `true`, rebinds the internal `--pz-cta-ink` custom property to
 * `var(--pz-accent-text)` instead of `var(--pz-ink)`. Uses `--pz-accent-text`,
 * NOT `--pz-accent-live` — `#3D8B6B` (live) under white is ~3.4:1 and fails
 * AA; `--pz-accent-text` is ~6:1 and passes. One flag covers both the filled
 * (`primary`) and outlined (`secondary`) variants because both read
 * `--pz-cta-ink`.
 */
@Component({
  selector: 'pz-cta',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './pz-cta.html',
  styleUrl: './pz-cta.scss',
})
export class PzCta {
  readonly variant = input<'primary' | 'secondary'>('primary');
  readonly href = input<string | undefined>(undefined);
  /** External links (tel:, wa.me, maps) open safely; internal routes never need this. */
  readonly external = input(false);
  /** Service-route-only accent (design.md D8). Never set outside a `[data-planta]` scope. */
  readonly accent = input(false);
}
