import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PzPicture } from '../../shared/ui/pz-picture/pz-picture';
import { PzPlate } from '../../shared/ui/pz-plate/pz-plate';
import { PzCta } from '../../shared/ui/pz-cta/pz-cta';
import { PzSpecimen } from '../../shared/ui/pz-specimen/pz-specimen';
import { SeoService } from '../../seo/application/seo.service';
import { buildHairSalonSchema } from '../../seo/generators/hair-salon.schema';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import type { Planta } from '../../seo/domain/route-seo';
import { SERVICE_INDEX, type ServicePath } from '../../services/domain/service-index';
import { formatFrom, pricingFor } from '../../services/domain/pricing';

/** Uppercase display label per plant (Stitch reading §3: `ROMERO`/`ESPLIEGO`/
 * `ESPARTO`/`VID`/`OLIVO` beneath each frieze glyph). `.pz-eyebrow` already
 * renders `text-transform: uppercase`, so this stays sentence case like every
 * other `.pz-eyebrow` usage on this page. */
const PLANTA_LABEL: Readonly<Record<Planta, string>> = {
  romero: 'Romero',
  espliego: 'Espliego',
  esparto: 'Esparto',
  vid: 'Vid',
  olivo: 'Olivo',
};

/**
 * `/` — home-page spec: layout shell + full SEO contract (title/description/
 * canonical are applied globally by `SeoService` from `route.data.seo`, see
 * `app.routes.ts`). The hero frieze and the `carta` block now link to all
 * five live service routes (home-page spec "Carta and frieze link to all
 * five service routes", REPLACING the earlier "no dead links to future
 * routes" rule — those routes now exist and are live, per Slices 4/5).
 */
@Component({
  selector: 'app-home-page',
  imports: [PzPicture, PzPlate, PzCta, PzSpecimen, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly seo = inject(SeoService);

  /** Hero frieze source — same `SERVICE_INDEX` module `/precios` and the
   * header dropdown read, so the link set can never drift from the registry. */
  protected readonly serviceIndex = SERVICE_INDEX;
  protected readonly plantaLabel = PLANTA_LABEL;

  /** Pre-formatted price text for a carta row — same `pricing.ts` module
   * `/precios` reads, so a figure can never diverge across the site. */
  protected priceFor(path: ServicePath): string {
    return formatFrom(pricingFor(path));
  }

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
