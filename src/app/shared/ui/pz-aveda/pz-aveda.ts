import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Aveda credential block — the strongest third-party trust signal on the
 * site, since it is a real brand relationship rather than a claim Pureza
 * makes about itself.
 *
 * The mark is set TYPOGRAPHICALLY, in the site's own body face, letterspaced
 * inside a bordered block. It deliberately does not reproduce, redraw or
 * generate an imitation of the Aveda logo — that is someone else's trademark,
 * and an approximation of it would be worse than none. If Virginia obtains the
 * official asset from Aveda, drop it in and swap the `<p>` in the template for
 * an `<img>`; nothing else here changes.
 *
 * `link` is optional so the block can sit ON the coloración page (where a link
 * to itself would be pointless) as well as off it.
 */
@Component({
  selector: 'pz-aveda',
  imports: [RouterLink],
  templateUrl: './pz-aveda.html',
  styleUrl: './pz-aveda.scss',
})
export class PzAveda {
  readonly title = input('Salón Aveda en Ciudad Real');
  readonly body = input(
    'Coloro con la línea botánica de Aveda: hasta un 96 % de ingredientes de origen natural, sin amoniaco. Es la misma marca que uso para el cuidado en cabina y la que te recomiendo para casa, porque conozco cómo se comporta en cada tipo de fibra.',
  );
  /** Internal route path, e.g. `/coloracion-vegetal-aveda`. Omit to render no link. */
  readonly link = input<string | undefined>(undefined);
  readonly linkLabel = input('Ver la coloración vegetal');
}
