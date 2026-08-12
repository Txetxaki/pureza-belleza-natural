// Pure filename/URL-derivation logic for the image pipeline (design.md §6).
//
// This is the ONE Angular-visible source of truth for the `{base}-{w}.{fmt}`
// naming convention: `pz-picture` imports it to build `srcset`s at render
// time, and this file's `.spec.ts` sibling tests it directly.
//
// `scripts/generate-image-variants.mjs` (the Node prebuild script that
// actually emits the files with `sharp`) is plain ESM outside `src/` and
// cannot import a `.ts` module without a compile step. Angular's vitest
// runner only discovers `src/**/*.spec.ts` (see tsconfig.spec.json), so a
// spec next to the script would never run under `npm test`. The script
// therefore mirrors this exact convention in vanilla JS — a small, deliberate
// duplication (same pattern already used for the token-contrast hex values in
// PR2's tokens.contrast.spec.ts). Keep both in sync if the convention changes.

/** Widths generated for every source image, in ascending order. */
export const IMAGE_VARIANT_WIDTHS: readonly number[] = [400, 800, 1200];
// 400  → pz-plate photo swatch / mobile viewport
// 800  → typical content-width image, tablet/desktop
// 1200 → hero / full-bleed banner, desktop

/** Formats generated for every width, most-modern-first (matches `<picture>` source order). */
export const IMAGE_VARIANT_FORMATS = ['avif', 'webp', 'jpg'] as const;
export type ImageVariantFormat = (typeof IMAGE_VARIANT_FORMATS)[number];

/** `{base}-{width}.{format}` — the one naming rule every consumer relies on. */
export function buildVariantFilename(
  base: string,
  width: number,
  format: ImageVariantFormat,
): string {
  return `${base}-${width}.${format}`;
}

/** `/images/{base}-{width}.{format}` — the public URL `pz-picture` renders. */
export function buildVariantPath(base: string, width: number, format: ImageVariantFormat): string {
  return `/images/${buildVariantFilename(base, width, format)}`;
}

/** A `srcset` attribute value for one format across every generated width. */
export function buildSrcset(base: string, format: ImageVariantFormat): string {
  return IMAGE_VARIANT_WIDTHS.map(
    (width) => `${buildVariantPath(base, width, format)} ${width}w`,
  ).join(', ');
}

/** The widest JPEG variant — used as the `<img>` fallback `src`. */
export function buildFallbackSrc(base: string): string {
  const widest = IMAGE_VARIANT_WIDTHS[IMAGE_VARIANT_WIDTHS.length - 1];
  return buildVariantPath(base, widest, 'jpg');
}
