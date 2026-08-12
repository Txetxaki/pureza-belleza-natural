import { Component, computed, input } from '@angular/core';
import { buildFallbackSrc, buildSrcset } from '../../utils/image-variants';

/**
 * The one image contract in this change (design.md §6). `base` is the fixed,
 * human-meaningful source name under `public/images/` (e.g.
 * `atmosfera-romero`); every URL is *derived*, never passed in directly, so
 * swapping an AI placeholder for the real photograph is a file replacement,
 * never a code edit. `width`/`height` are required so the browser always has
 * an aspect ratio before the image loads — no CLS.
 */
@Component({
  selector: 'pz-picture',
  imports: [],
  templateUrl: './pz-picture.html',
  styleUrl: './pz-picture.scss',
})
export class PzPicture {
  /** Source name under `public/images/`, without extension or width suffix. */
  readonly base = input.required<string>();
  readonly alt = input.required<string>();
  readonly width = input.required<number>();
  readonly height = input.required<number>();

  /** LCP candidate (e.g. the home hero). Sets `fetchpriority="high"` + eager loading. */
  readonly priority = input(false);

  // EXCEPTION POINT (design.md §6 / task 4.9): every photograph in this
  // change ships untinted — this input exists ONLY for the home hero
  // portrait derived from `info/virginia.jpeg`, which is the sole explicit
  // duotone exception. That route doesn't land until PR5; this flag is
  // wired here now so the primitive doesn't need to change shape later.
  // Do not set this on any other `pz-picture` usage.
  readonly duotone = input(false);

  protected readonly avifSrcset = computed(() => buildSrcset(this.base(), 'avif'));
  protected readonly webpSrcset = computed(() => buildSrcset(this.base(), 'webp'));
  protected readonly fallbackSrc = computed(() => buildFallbackSrc(this.base()));

  protected readonly loading = computed<'eager' | 'lazy'>(() =>
    this.priority() ? 'eager' : 'lazy',
  );
  protected readonly fetchPriority = computed<'high' | 'auto'>(() =>
    this.priority() ? 'high' : 'auto',
  );
}
