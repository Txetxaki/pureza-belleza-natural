import { Component, input } from '@angular/core';

/**
 * The Pureza mark, drawn from the salon's real logo (gold script "pureza /
 * BELLEZA NATURAL" over a pink-and-grey watercolour circle).
 *
 * It used to be typographic — EB Garamond italic over a hairline — because no
 * logo file existed. Now there is one, and the business uses it everywhere
 * else (Google Business, Instagram, the salon window), so the site follows.
 *
 * Two cuts, chosen by `size`:
 * - `'lead'` (header): only the gold signature, cut out of the watercolour on
 *   a transparent ground (`public/brand/pureza-firma.png`). At header height
 *   the full circle would shrink the script to a few unreadable pixels.
 * - `'display'` (footer): the full watercolour mark
 *   (`public/brand/pureza-acuarela.webp`), blended with `multiply` so the
 *   paper-white of the source disappears into the cream ground.
 *
 * The accessible text stays in the DOM, visually hidden: the link around this
 * component carries the name, and the text keeps "Pureza Belleza Natural"
 * searchable and copyable.
 */
@Component({
  selector: 'pz-wordmark',
  templateUrl: './pz-wordmark.html',
  styleUrl: './pz-wordmark.scss',
  host: { '[attr.data-size]': 'size()' },
})
export class PzWordmark {
  readonly size = input<'lead' | 'display'>('lead');

  /**
   * Screen readers get one clean name instead of "Pureza … Belleza Natural"
   * read as two disconnected fragments, and the tagline is hidden from them
   * rather than duplicated. The visible text is unchanged either way.
   */
  readonly label = input('Pureza Belleza Natural');
}
