import { Component } from '@angular/core';
import { PzServiceAnchor } from '../../../services/ui/pz-service-anchor/pz-service-anchor';

/**
 * `/diario/como-cuidar-rastas-para-que-duren` — one of the three launch
 * articles (tasks.md 8.10-8.12). Pure prose content, no SEO responsibility
 * (owned by `post-page.ts`/`post-seo.resolver.ts` — see the sibling
 * coloración post's doc comment for the full split rationale). Links to
 * `/rastas` with that route's exact `primaryKeyword` as anchor text
 * (`pz-service-anchor`). H1 deliberately contains no "Ciudad Real".
 */
@Component({
  selector: 'app-como-cuidar-rastas-para-que-duren-post',
  imports: [PzServiceAnchor],
  templateUrl: './como-cuidar-rastas-para-que-duren-post.html',
})
export class ComoCuidarRastasParaQueDurenPost {}
