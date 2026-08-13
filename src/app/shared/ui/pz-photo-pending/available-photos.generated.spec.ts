import { readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AVAILABLE_PHOTO_BASES } from './available-photos.generated';

// Mirrors scripts/generate-image-variants.mjs's isSourceImage/baseNameOf.
// That script is plain ESM outside `src/` and cannot be imported into this
// strict Angular TS build without type declarations; Angular's vitest builder
// only discovers `src/**/*.spec.ts` anyway (see that script's own header
// comment), so the tiny filtering rule is duplicated here instead — same
// deliberate, documented duplication already used for image-variants.ts's
// naming convention and tokens.contrast.spec.ts's hex values.
const SOURCE_EXTENSION = '.jpg';
const VARIANT_SUFFIX_RE = /-\d+\.(avif|webp|jpg)$/i;

function isSourceImage(filename: string): boolean {
  return filename.toLowerCase().endsWith(SOURCE_EXTENSION) && !VARIANT_SUFFIX_RE.test(filename);
}

function baseNameOf(filename: string): string {
  return filename.slice(0, filename.length - extname(filename).length);
}

describe('available-photos.generated.ts — sync guard (design.md D9)', () => {
  it('matches a fresh readdirSync(public/images) scan — no drift between the committed file and disk', () => {
    const imagesDir = join(process.cwd(), 'public', 'images');
    const entries = readdirSync(imagesDir);
    const freshBases = entries.filter(isSourceImage).map(baseNameOf).sort();

    expect([...AVAILABLE_PHOTO_BASES].sort()).toEqual(freshBases);
  });

  it('is non-empty — the repo always carries at least the AI atmosphere bases', () => {
    expect(AVAILABLE_PHOTO_BASES.length).toBeGreaterThan(0);
  });
});
