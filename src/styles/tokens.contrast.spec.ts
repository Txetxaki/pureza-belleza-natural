import { describe, expect, it } from 'vitest';

/**
 * WCAG 2.2 relative-luminance + contrast-ratio calculation, computed from
 * the literal hex values that mirror `src/styles/_tokens.scss`'s
 * `--pz-*-text` custom properties.
 *
 * SCSS custom properties cannot be imported into a Vitest run, so these
 * hexes are the one intentional point of duplication: if `_tokens.scss`
 * changes a `-text` token, this file's expected ratios go stale and the
 * assertions below fail loudly instead of silently drifting.
 *
 * design-system spec — "Text variant meets AA contrast": every `-text`
 * token MUST reach WCAG 2.2 AA (>= 4.5:1) against the background token.
 */

const PZ_SURFACE = '#FFFFFF';

const TEXT_TOKENS = {
  '--pz-romero-text': '#2C6A4F',
  '--pz-espliego-text': '#5B4B9E',
  '--pz-esparto-text': '#7D5A10',
  '--pz-vid-text': '#8E2F44',
  '--pz-olivo-text': '#4E5A17',
} as const;

// design.md §1 "Verified contrast on --pz-surface" — computed independently
// below and asserted to match, so a hex edit that quietly weakens contrast
// fails this test even if it stays above the 4.5:1 floor.
const EXPECTED_RATIOS: Record<keyof typeof TEXT_TOKENS, number> = {
  '--pz-romero-text': 6.4,
  '--pz-espliego-text': 7.1,
  '--pz-esparto-text': 6.3,
  '--pz-vid-text': 8.0,
  '--pz-olivo-text': 7.5,
};

const WCAG_AA_NORMAL_TEXT = 4.5;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function srgbChannelToLinear(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const [rLin, gLin, bLin] = [r, g, b].map(srgbChannelToLinear);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function contrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexA);
  const luminanceB = relativeLuminance(hexB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('design tokens — plant accent -text variants vs --pz-surface', () => {
  it.each(Object.entries(TEXT_TOKENS))(
    '%s meets WCAG AA (>= 4.5:1) against #FFFFFF',
    (_tokenName, hex) => {
      const ratio = contrastRatio(hex, PZ_SURFACE);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    },
  );

  it.each(Object.entries(TEXT_TOKENS))(
    '%s ratio matches the value verified in design.md',
    (tokenName, hex) => {
      const ratio = contrastRatio(hex, PZ_SURFACE);
      const expected = EXPECTED_RATIOS[tokenName as keyof typeof TEXT_TOKENS];
      expect(ratio).toBeCloseTo(expected, 1);
    },
  );
});

/**
 * tasks.md 2.6 / design.md Open Questions (resolved): `.pz-eyebrow--accent`
 * renders at 11px/700 (`--pz-text-label` + `font-weight: 700`, see
 * `_typography.scss`'s `.pz-eyebrow`) — WCAG 2.2 §1.4.3 only lowers the bar
 * to 3:1 for text at >=18.66px/700 or >=24px/400 ("large text"). 11px/700 is
 * far below that threshold, so it needs the FULL 4.5:1 floor, not 3:1. This
 * is deliberately the same computation as the block above (same tokens, same
 * background) — the assertions are duplicated so a future engineer skimming
 * only this describe block still sees the eyebrow-role floor proven directly,
 * not inferred from a differently-named test elsewhere.
 */
describe('.pz-eyebrow--accent — 11px/700 is normal-size text (WCAG 2.2 §1.4.3), needs 4.5:1 not 3:1', () => {
  it.each(Object.entries(TEXT_TOKENS))(
    '%s clears the eyebrow-role floor of 4.5:1 against #FFFFFF',
    (_tokenName, hex) => {
      const ratio = contrastRatio(hex, PZ_SURFACE);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    },
  );

  it('all five plants pass today — the --pz-ink-soft fallback stays documented, not implemented (design.md Open Questions)', () => {
    // Design's resolution: "if all five already pass, assert that and leave
    // the fallback path documented, not implemented speculatively." If this
    // ever flips false, the failing plant's `.pz-eyebrow--accent` usage MUST
    // fall back to `--pz-ink-soft` instead — do not silently relax this test.
    const allPass = Object.values(TEXT_TOKENS).every(
      (hex) => contrastRatio(hex, PZ_SURFACE) >= WCAG_AA_NORMAL_TEXT,
    );
    expect(allPass).toBe(true);
  });
});
