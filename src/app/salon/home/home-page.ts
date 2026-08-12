import { Component, OnInit, inject } from '@angular/core';
import { PzPicture } from '../../shared/ui/pz-picture/pz-picture';
import { PzPlate } from '../../shared/ui/pz-plate/pz-plate';
import { PzCta } from '../../shared/ui/pz-cta/pz-cta';
import { SeoService } from '../../seo/application/seo.service';
import { buildHairSalonSchema } from '../../seo/generators/hair-salon.schema';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';

/**
 * `/` — home-page spec: layout shell + full SEO contract (title/description/
 * canonical are applied globally by `SeoService` from `route.data.seo`, see
 * `app.routes.ts`). Non-interactive `carta-teaser`: the five `pz-plate` rows
 * intentionally carry no `routerLink` — the five service routes they portray
 * don't exist yet in this change (home-page spec "no dead links to future
 * routes"; design.md §6/§7).
 */
@Component({
  selector: 'app-home-page',
  imports: [PzPicture, PzPlate, PzCta],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    // design.md §4/§7 literally says "HairSalon (once, from the shell) and
    // BreadcrumbList (per route, skipped on /)". The BINDING specs disagree
    // on both points: home-page spec requires HairSalon + BreadcrumbList on
    // `/`, and contact-page spec (plus the resolved decision recorded in
    // `sdd/foundation/apply-progress`, Engram project "virginia") requires
    // `/contacto` to carry NO HairSalon block. Emitting HairSalon from the
    // page container that actually needs it (not globally from the shell) is
    // the only way to satisfy both prerendered pages independently — this is
    // a deliberate, documented deviation from design.md's literal wording in
    // favour of the binding spec.md scenarios.
    this.seo.setJsonLd('hair-salon', buildHairSalonSchema());
    this.seo.setJsonLd('breadcrumb', buildBreadcrumbListSchema([{ name: 'Inicio', path: '' }]));
  }
}
