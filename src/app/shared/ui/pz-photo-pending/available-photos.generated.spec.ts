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
const WIDTHS = [400, 800, 1200];
const FORMATS = ['avif', 'webp', 'jpg'];
// Only the widths the pipeline actually emits, never a bare `-\d+`. This
// duplicated rule previously carried the same bug as the script it mirrors —
// `-\d+` also matches `antes-despues-romero-1.jpg` — so the guard agreed with
// the generator and neither noticed that fifteen real photos were being
// skipped. Duplicating a rule is only safe when both copies are right.
const VARIANT_SUFFIX_RE = new RegExp(`-(${WIDTHS.join('|')})\\.(${FORMATS.join('|')})$`, 'i');

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

  it('treats a source photo whose name ends in a digit as a source, not as build output', () => {
    // The exact collision that hid all fifteen before/after photos: their
    // names end in -1/-2/-3, which a bare `-\d+` variant pattern swallows.
    expect(isSourceImage('antes-despues-romero-1.jpg')).toBe(true);
    expect(isSourceImage('salon-interior-1.jpg')).toBe(true);

    // ...while the real variants are still correctly excluded.
    expect(isSourceImage('antes-despues-romero-1-800.jpg')).toBe(false);
    expect(isSourceImage('atmosfera-romero-1200.jpg')).toBe(false);
    expect(isSourceImage('atmosfera-romero-400.avif')).toBe(false);
  });

  it('lists every before/after and result slot the service pages reference', () => {
    const plantas = ['romero', 'espliego', 'esparto', 'vid', 'olivo'];
    const required = [
      'salon-interior-1',
      ...plantas.map((planta) => `resultado-${planta}`),
      ...plantas.flatMap((planta) => [1, 2, 3].map((n) => `antes-despues-${planta}-${n}`)),
    ];

    expect(required.filter((base) => !AVAILABLE_PHOTO_BASES.includes(base))).toEqual([]);
  });
});
