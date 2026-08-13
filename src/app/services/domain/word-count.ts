// Pure word-count utility shared by every service page's word-floor
// assertions (service-pages spec, "Word count within range" — both the
// 150–200 "qué es y para quién" scenario and the 700–900 total-body
// scenario). Built once here instead of five times.

/**
 * Counts words in `text` by collapsing runs of whitespace (spaces, tabs,
 * newlines) into single separators and trimming leading/trailing
 * whitespace before splitting. An empty or whitespace-only string counts
 * as zero words, never one.
 */
export function countWords(text: string): number {
  const collapsed = text.trim().replace(/\s+/g, ' ');
  return collapsed === '' ? 0 : collapsed.split(' ').length;
}
