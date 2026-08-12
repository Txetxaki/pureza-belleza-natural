// Tests `scripts/generate-sitemap.mjs`'s `pathToUrl` directly — see the
// comment in `validate-keyword-uniqueness.spec.ts` for why this lives under
// `src/app/seo/` (Angular's vitest builder only discovers `src/**/*.spec.ts`)
// and why it imports the script instead of duplicating its logic.
import { sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pathToUrl } from '../../../scripts/generate-sitemap.mjs';

describe('pathToUrl', () => {
  it('maps the root directory to the site root URL', () => {
    expect(pathToUrl('')).toBe('https://purezabellezanatural.es/');
  });

  it('maps "." (relative() at the root) to the site root URL', () => {
    expect(pathToUrl('.')).toBe('https://purezabellezanatural.es/');
  });

  it('maps a top-level directory to its path URL, no trailing slash', () => {
    expect(pathToUrl('contacto')).toBe('https://purezabellezanatural.es/contacto');
  });

  it('normalizes the platform path separator (node:path sep) to a forward slash', () => {
    const relativeDir = ['diario', 'mi-post'].join(sep);
    expect(pathToUrl(relativeDir)).toBe('https://purezabellezanatural.es/diario/mi-post');
  });

  it('matches the canonicalUrl() rule in seo/domain/route-seo.ts (design risk E)', () => {
    // canonicalUrl('') === `${SITE.url}/` and canonicalUrl('contacto') ===
    // `${SITE.url}/contacto` — both scripts must derive identical URLs from
    // identical inputs; this is the manual half of that invariant (a real
    // cross-implementation Playwright assertion lands in PR5).
    expect(pathToUrl('')).toBe('https://purezabellezanatural.es/');
    expect(pathToUrl('contacto')).toBe('https://purezabellezanatural.es/contacto');
  });
});
