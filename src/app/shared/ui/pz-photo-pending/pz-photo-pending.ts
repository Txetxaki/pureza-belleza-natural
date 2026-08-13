import { Component, computed, input } from '@angular/core';
import { PzPicture } from '../pz-picture/pz-picture';
import { AVAILABLE_PHOTO_BASES } from './available-photos.generated';

/**
 * Honest "foto pendiente de la sesión" placeholder for the service-result and
 * before/after photography we do not have yet (BRIEF §4 — never fabricate an
 * AI hair result, never use stock). Same input contract as `pz-picture`
 * (`base`/`alt`/`width`/`height`, all required) so swapping in the real photo
 * is a pure file drop: once `base` appears in `available-photos.generated.ts`
 * (design.md D9, emitted by `generate-image-variants.mjs`), this component
 * renders `pz-picture` instead of the placeholder with ZERO template/code
 * change at any call site.
 */
@Component({
  selector: 'pz-photo-pending',
  imports: [PzPicture],
  templateUrl: './pz-photo-pending.html',
  styleUrl: './pz-photo-pending.scss',
})
export class PzPhotoPending {
  readonly base = input.required<string>();
  readonly alt = input.required<string>();
  readonly width = input.required<number>();
  readonly height = input.required<number>();

  protected readonly available = computed(() => AVAILABLE_PHOTO_BASES.includes(this.base()));
  /** Correct final aspect-ratio on the placeholder itself, so layout is already right. */
  protected readonly aspectRatio = computed(() => `${this.width()} / ${this.height()}`);
}
