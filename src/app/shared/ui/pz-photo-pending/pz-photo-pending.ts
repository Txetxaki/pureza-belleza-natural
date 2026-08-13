import { Component, computed, input } from '@angular/core';
import { PzPicture } from '../pz-picture/pz-picture';
import { AVAILABLE_PHOTO_BASES } from './available-photos.generated';

/**
 * Renders the real photograph when it exists on disk, and a silent tinted
 * frame of the right shape when it does not.
 *
 * Same input contract as `pz-picture` (`base`/`alt`/`width`/`height`, all
 * required) so swapping in a photo is a pure file drop: once `base` appears in
 * `available-photos.generated.ts` (design.md D9, emitted by
 * `generate-image-variants.mjs`), this renders `pz-picture` instead, with ZERO
 * template or code change at any call site.
 *
 * Every slot is currently filled by `scripts/generate-photos-comfyui.mjs`, so
 * the fallback branch should not render anywhere in production — it stays as
 * the safety net for a slot added faster than its photograph.
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
