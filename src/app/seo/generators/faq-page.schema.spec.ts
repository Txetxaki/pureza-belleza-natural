import { describe, expect, it } from 'vitest';
import { buildFaqPageSchema, type FaqEntry } from './faq-page.schema';

describe('buildFaqPageSchema (seo-infrastructure spec, "All four generators produce valid JSON-LD")', () => {
  const faq: readonly FaqEntry[] = [
    {
      question: '¿Cuánto dura una coloración sin amoniaco?',
      answer: 'Entre 90 y 120 minutos según la longitud del cabello.',
    },
    {
      question: '¿Es compatible con cabello con mechas previas?',
      answer: 'Sí, se valora en la consulta previa a la cita.',
    },
    {
      question: '¿Necesito preparación antes de venir?',
      answer: 'No, basta con venir con el cabello limpio y seco.',
    },
  ];

  it('produces a valid, parseable FAQPage block with mainEntity 1:1 to the input array', () => {
    // Round-trip through JSON to test what actually ships in the
    // <script type="application/ld+json"> tag, not just the in-memory object.
    const parsed = JSON.parse(JSON.stringify(buildFaqPageSchema(faq))) as Record<string, unknown>;

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('FAQPage');

    const mainEntity = parsed['mainEntity'] as Array<Record<string, unknown>>;
    expect(mainEntity).toHaveLength(faq.length);

    mainEntity.forEach((entry, index) => {
      expect(entry['@type']).toBe('Question');
      expect(entry['name']).toBe(faq[index].question);
      const acceptedAnswer = entry['acceptedAnswer'] as Record<string, unknown>;
      expect(acceptedAnswer['@type']).toBe('Answer');
      expect(acceptedAnswer['text']).toBe(faq[index].answer);
    });
  });

  it('produces an empty mainEntity for an empty input array — never a fabricated question', () => {
    const parsed = JSON.parse(JSON.stringify(buildFaqPageSchema([]))) as Record<string, unknown>;
    expect(parsed['mainEntity']).toEqual([]);
  });
});
