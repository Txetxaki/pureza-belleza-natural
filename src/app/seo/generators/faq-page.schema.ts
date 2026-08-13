// `@type: "FAQPage"` — one node per service/article page's FAQ section.
// `mainEntity` MUST be 1:1 with the input array so the JSON-LD can never
// list a different question set than what's visibly rendered
// (service-pages spec, "FAQ count and schema match" — the generator half;
// the component rendering the identical array lands in `pz-service-page`,
// Slice 2b).
export interface FaqEntry {
  readonly question: string;
  readonly answer: string;
}

export function buildFaqPageSchema(faq: readonly FaqEntry[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}
