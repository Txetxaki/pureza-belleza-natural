import { Component, input } from '@angular/core';

/**
 * The Pureza wordmark: the business's full registered name, set as a lockup
 * rather than as the single word "Pureza" the header shipped with.
 *
 * It is typographic, not an image — no SVG path data, no bitmap. That means it
 * inherits `currentColor`, scales with the type system, stays selectable and
 * searchable, and never needs a second file for a dark or small variant.
 *
 * Shape: the display face carries `Pureza` in italic; a hairline sits beneath
 * it, and `Belleza Natural` follows in letterspaced small caps of the body
 * face. The hairline is what makes it read as one mark instead of two stacked
 * words.
 *
 * `size` is the only knob. `'lead'` is the header's inline size; `'display'`
 * is the footer's, where the mark has room to breathe. Callers never set
 * font-size on the host — that would desynchronise the two lines and the rule.
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
