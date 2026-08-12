import { describe, expect, it } from 'vitest';
import {
  buildFallbackSrc,
  buildSrcset,
  buildVariantFilename,
  buildVariantPath,
  IMAGE_VARIANT_FORMATS,
  IMAGE_VARIANT_WIDTHS,
} from './image-variants';

describe('buildVariantFilename', () => {
  it('derives {base}-{width}.{format}', () => {
    expect(buildVariantFilename('atmosfera-romero', 800, 'avif')).toBe('atmosfera-romero-800.avif');
    expect(buildVariantFilename('manos-pigmento', 400, 'webp')).toBe('manos-pigmento-400.webp');
    expect(buildVariantFilename('textura-lino', 1200, 'jpg')).toBe('textura-lino-1200.jpg');
  });
});

describe('buildVariantPath', () => {
  it('prefixes the derived filename with /images/', () => {
    expect(buildVariantPath('atmosfera-vid', 400, 'jpg')).toBe('/images/atmosfera-vid-400.jpg');
  });
});

describe('buildSrcset', () => {
  it('joins every configured width for one format, widest last', () => {
    const srcset = buildSrcset('atmosfera-esparto', 'avif');
    const parts = srcset.split(', ');

    expect(parts).toHaveLength(IMAGE_VARIANT_WIDTHS.length);
    expect(parts[0]).toBe('/images/atmosfera-esparto-400.avif 400w');
    expect(parts.at(-1)).toBe(
      `/images/atmosfera-esparto-${IMAGE_VARIANT_WIDTHS.at(-1)}.avif ${IMAGE_VARIANT_WIDTHS.at(-1)}w`,
    );
  });

  it.each(IMAGE_VARIANT_FORMATS)('produces a valid srcset for format "%s"', (format) => {
    const srcset = buildSrcset('atmosfera-olivo', format);
    for (const width of IMAGE_VARIANT_WIDTHS) {
      expect(srcset).toContain(`atmosfera-olivo-${width}.${format} ${width}w`);
    }
  });
});

describe('buildFallbackSrc', () => {
  it('uses the widest configured variant as the plain <img> fallback', () => {
    const widest = IMAGE_VARIANT_WIDTHS.at(-1);
    expect(buildFallbackSrc('manos-pigmento')).toBe(`/images/manos-pigmento-${widest}.jpg`);
  });
});
