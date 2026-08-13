import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PzCta } from '../../shared/ui/pz-cta/pz-cta';
import { PzSpecimen } from '../../shared/ui/pz-specimen/pz-specimen';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { SITE } from '../../seo/domain/site';
import { buildWhatsAppUrl } from '../../shared/utils/contact-links';
import { SERVICE_INDEX, type ServiceIndexEntry } from '../../services/domain/service-index';
import { pricingFor, type ServicePricing } from '../../services/domain/pricing';

interface PrecioRow {
  readonly entry: ServiceIndexEntry;
  readonly pricing: ServicePricing;
}

// One row per SERVICE_INDEX entry (registry order), each paired with its
// pricing.ts entry — computed once at module load, same convention as the
// five service pages' CONTENT constant (never recomputed per render).
const ROWS: readonly PrecioRow[] = SERVICE_INDEX.map((entry) => ({
  entry,
  pricing: pricingFor(entry.path),
}));

/**
 * `/precios` — precios-page spec: the ONE page where all five plant accents
 * legitimately coexist, as five SIBLING `[data-planta]` scopes (design.md's
 * corrected invariant, Engram #2311 point 2; design-system spec's "sole
 * exception"). One `<article>` per `SERVICE_INDEX` entry, each carrying its
 * own `data-planta` — never nested inside one another or inside a sixth
 * wrapping scope. Tariff rows come straight from `pricing.ts` (task 1.2):
 * every entry is still `status: 'pending'` at launch, so every figure
 * renders "Consultar" — no invented price or duration (decision #2267).
 * Each row links to its matching live service route.
 */
@Component({
  selector: 'app-precios-page',
  imports: [PzCta, PzSpecimen, RouterLink],
  templateUrl: './precios-page.html',
  styleUrl: './precios-page.scss',
})
export class PreciosPage implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly rows = ROWS;
  protected readonly whatsappUrl = buildWhatsAppUrl(SITE.telephone);

  ngOnInit(): void {
    // Defensive removal on a client-side navigation from `/` — same gap
    // documented in contact-page.ts's ngOnInit.
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd(
      'breadcrumb',
      buildBreadcrumbListSchema([
        { name: 'Inicio', path: '' },
        { name: 'Precios', path: 'precios' },
      ]),
    );
  }
}
