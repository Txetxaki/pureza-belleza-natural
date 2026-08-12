#!/usr/bin/env node
// prebuild — reads every source photo in public/images/ and emits
// {base}-{width}.{avif|webp|jpg} variants with sharp (design.md §6).
//
// Naming convention MIRRORS `src/app/shared/utils/image-variants.ts`
// (`buildVariantFilename`) — that TS module is what `pz-picture` and
// `pz-static-map` actually import at runtime/render time, and it is the one
// covered by an `npm test`-discoverable spec (Angular's vitest builder only
// picks up `src/**/*.spec.ts`, so a spec next to this plain-ESM script would
// never run). This duplication is deliberate and small: keep both in sync if
// the width/format convention ever changes (same pattern as PR2's token
// hex-value duplication in tokens.contrast.spec.ts).
//
// Exported pure functions below are unit-testable independent of the `main()`
// side effects (sharp calls, filesystem I/O), even though — per the note
// above — the actual `npm test` coverage lives in image-variants.spec.ts.

import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const WIDTHS = [400, 800, 1200];
export const FORMATS = ['avif', 'webp', 'jpg'];

const SOURCE_EXTENSION = '.jpg';
// Matches already-generated variants (e.g. "atmosfera-romero-800.avif") so a
// re-run never treats its own output as a new source image.
const VARIANT_SUFFIX_RE = /-\d+\.(avif|webp|jpg)$/i;

/** `{base}-{width}.{format}` — the one naming rule every consumer relies on. */
export function buildVariantFilename(base, width, format) {
  return `${base}-${width}.${format}`;
}

/** Strips the source `.jpg` extension to get the `base` name. */
export function baseNameOf(filename) {
  return filename.slice(0, filename.length - extname(filename).length);
}

/** True for a source photo this script should generate variants from. */
export function isSourceImage(filename) {
  return filename.toLowerCase().endsWith(SOURCE_EXTENSION) && !VARIANT_SUFFIX_RE.test(filename);
}

/** Every `{base}-{width}.{format}` filename this script must emit for one source file. */
export function variantFilenamesFor(filename) {
  const base = baseNameOf(filename);
  return WIDTHS.flatMap((width) =>
    FORMATS.map((format) => buildVariantFilename(base, width, format)),
  );
}

async function generateVariants(imagesDir, sharpModule) {
  const entries = await readdir(imagesDir);
  const sources = entries.filter(isSourceImage);

  if (sources.length === 0) {
    console.log(`[generate-image-variants] no source images found in ${imagesDir}`);
    return;
  }

  for (const filename of sources) {
    const inputPath = join(imagesDir, filename);
    const base = baseNameOf(filename);

    for (const width of WIDTHS) {
      const resized = sharpModule(inputPath).resize({ width });

      for (const format of FORMATS) {
        const outputPath = join(imagesDir, buildVariantFilename(base, width, format));
        await resized.clone().toFormat(format).toFile(outputPath);
      }
    }

    console.log(
      `[generate-image-variants] ${filename} → ${WIDTHS.length * FORMATS.length} variants`,
    );
  }
}

async function main() {
  const imagesDir = join(process.cwd(), 'public', 'images');
  const { default: sharp } = await import('sharp');
  await generateVariants(imagesDir, sharp);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((error) => {
    console.error('[generate-image-variants] failed:', error);
    process.exitCode = 1;
  });
}
