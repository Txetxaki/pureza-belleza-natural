import { Component } from '@angular/core';
import { PzServiceAnchor } from '../../../services/ui/pz-service-anchor/pz-service-anchor';

/**
 * `/diario/cuanto-dura-coloracion-sin-amoniaco` — one of the three launch
 * articles (tasks.md 8.10-8.12). Pure prose content, rendered via
 * `NgComponentOutlet` by `post-page.ts` (the shell owns SEO: title/
 * description/canonical via `post-seo.resolver.ts`, `BlogPosting` JSON-LD —
 * this component carries none of that, same "body content, no metadata
 * responsibility" split as a service page's `pzWhatIs`/`pzProcess` slots).
 * Answers a nationally-searched informational question and links to
 * `/coloracion-vegetal-aveda` with that route's exact `primaryKeyword` as
 * anchor text (`pz-service-anchor`, diario spec "Anchor text matches target
 * keyword"). H1 deliberately contains no "Ciudad Real" (diario spec).
 */
@Component({
  selector: 'app-cuanto-dura-coloracion-sin-amoniaco-post',
  imports: [PzServiceAnchor],
  templateUrl: './cuanto-dura-coloracion-sin-amoniaco-post.html',
})
export class CuantoDuraColoracionSinAmoniacoPost {}
