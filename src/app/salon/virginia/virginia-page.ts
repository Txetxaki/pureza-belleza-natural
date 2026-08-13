import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PzCta } from '../../shared/ui/pz-cta/pz-cta';
import { PzPicture } from '../../shared/ui/pz-picture/pz-picture';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { buildPersonSchema } from '../../seo/generators/person.schema';
import { SITE } from '../../seo/domain/site';
import { buildWhatsAppUrl } from '../../shared/utils/contact-links';

/**
 * `/virginia` — virginia-page spec: E-E-A-T narrative page. MUST NOT bind
 * any `[data-planta]` accent scope anywhere in this subtree — unlike the
 * five service routes, this page is personal/neutral, not promotional
 * (tasks.md Slice 6a). Emits `Person` JSON-LD (person.schema.ts, task 6.1) —
 * the stable `@id` every `Service.provider`/`BlogPosting.author` traces back
 * to — plus `BreadcrumbList`.
 *
 * Content is grounded ONLY in what's established (orchestrator brief, "do
 * not invent years of experience, training history, awards, certifications
 * or client counts"): Virginia owns Pureza, works with one client at a
 * time, uses Aveda botanical colour, and the salon carries a 5.0 average on
 * Google. Nothing beyond that is asserted.
 */
@Component({
  selector: 'app-virginia-page',
  imports: [PzCta, PzPicture, RouterLink],
  templateUrl: './virginia-page.html',
  styleUrl: './virginia-page.scss',
})
export class VirginiaPage implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly whatsappUrl = buildWhatsAppUrl(SITE.telephone);

  ngOnInit(): void {
    // Defensive removal on a client-side navigation from `/` — same gap
    // documented in contact-page.ts's ngOnInit / ports.ts's JsonLdPort.remove.
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd('person', buildPersonSchema());
    this.seo.setJsonLd(
      'breadcrumb',
      buildBreadcrumbListSchema([
        { name: 'Inicio', path: '' },
        { name: 'Virginia', path: 'virginia' },
      ]),
    );
  }
}
