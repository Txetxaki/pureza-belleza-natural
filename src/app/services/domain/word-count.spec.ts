import { describe, expect, it } from 'vitest';
import { countWords } from './word-count';

describe('countWords (service-pages spec, "Word count within range")', () => {
  it('counts words separated by single spaces', () => {
    expect(countWords('uno dos tres')).toBe(3);
  });

  it('collapses runs of whitespace (tabs, newlines, repeated spaces) into one separator', () => {
    expect(countWords('uno   dos\tdos\n\ntres')).toBe(4);
  });

  it('trims leading and trailing whitespace before counting', () => {
    expect(countWords('   uno dos   ')).toBe(2);
  });

  it('returns 0 for an empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for a whitespace-only string, never 1', () => {
    expect(countWords('   \n\t  ')).toBe(0);
  });

  it('counts a single word as 1', () => {
    expect(countWords('palabra')).toBe(1);
  });

  it('measures a realistic multi-sentence paragraph accurately', () => {
    const paragraph =
      'La coloración vegetal respeta la fibra capilar y el cuero cabelludo. ' +
      'No contiene amoníaco ni químicos agresivos, y el resultado dura semanas.';
    expect(countWords(paragraph)).toBe(22);
  });
});
