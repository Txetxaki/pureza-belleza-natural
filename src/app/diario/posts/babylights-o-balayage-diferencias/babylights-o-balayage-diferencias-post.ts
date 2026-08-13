import { Component } from '@angular/core';
import { PzServiceAnchor } from '../../../services/ui/pz-service-anchor/pz-service-anchor';

/**
 * `/diario/babylights-o-balayage-diferencias` — one of the three launch
 * articles (tasks.md 8.10-8.12). Pure prose content, no SEO responsibility
 * (see the coloración post's doc comment for the split rationale). Attacks
 * the study's contested "mechas" term sideways via `babylights`, linking to
 * `/mechas-babylights-balayage` with that route's exact `primaryKeyword` as
 * anchor text (`pz-service-anchor`). H1 deliberately contains no "Ciudad
 * Real".
 */
@Component({
  selector: 'app-babylights-o-balayage-diferencias-post',
  imports: [PzServiceAnchor],
  templateUrl: './babylights-o-balayage-diferencias-post.html',
})
export class BabylightsOBalayageDiferenciasPost {}
