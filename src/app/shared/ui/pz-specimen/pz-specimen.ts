import { Component, input } from '@angular/core';
import type { Planta } from '../../../seo/domain/route-seo';

/**
 * The five botanical line-icon glyphs, extracted from `home-page.html`'s
 * inline `<svg>`s (design.md D3 — "needed in four places": the home hero
 * frieze, `/precios`, the five service pages, and the home carta). This
 * slice ships the component itself only; `home-page.html` keeps its own
 * inline copies untouched until Slice 7 swaps them in as a pure addition
 * (tasks.md 2.1 — deliberately does not touch `home-page.html`).
 *
 * `pz-plate`'s `specimen` input stays an `<ng-template>` (unchanged contract,
 * design D3): callers wrap this component in one, e.g.
 * `<ng-template #s><pz-specimen planta="romero" /></ng-template>`.
 */
@Component({
  selector: 'pz-specimen',
  imports: [],
  templateUrl: './pz-specimen.html',
  styleUrl: './pz-specimen.scss',
})
export class PzSpecimen {
  readonly planta = input.required<Planta>();
}
