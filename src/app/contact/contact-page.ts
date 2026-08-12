import { Component, OnInit, inject } from '@angular/core';
import { PzCta } from '../shared/ui/pz-cta/pz-cta';
import { PzStaticMap } from '../shared/ui/pz-static-map/pz-static-map';
import { SeoService } from '../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../seo/generators/breadcrumb-list.schema';
import { SITE } from '../seo/domain/site';
import { buildTelUrl, buildWhatsAppUrl } from '../shared/utils/contact-links';

interface HoursRow {
  readonly day: string;
  /** `null` = closed. */
  readonly hours: string | null;
}

/**
 * `/contacto` — contact-page spec: WhatsApp-first primary CTA, `tel:`
 * secondary, click-to-load static map (no eager iframe), no booking form (no
 * backend in this change — `openspec/config.yaml`'s "Phase 1 ships now" note).
 */
@Component({
  selector: 'app-contact-page',
  imports: [PzCta, PzStaticMap],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
})
export class ContactPage implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly site = SITE;
  protected readonly whatsappUrl = buildWhatsAppUrl(SITE.telephone);
  protected readonly telUrl = buildTelUrl(SITE.telephone);
  protected readonly mapAddress = `${SITE.streetAddress}, ${SITE.postalCode} ${SITE.addressLocality}`;

  // Real business hours (info/inicial.txt §4) — same data the (future)
  // `openingHoursSpecification` JSON-LD would use; not added to the
  // `HairSalon` schema here because `/contacto` deliberately carries no
  // `HairSalon` block at all (see ngOnInit below).
  protected readonly hours: readonly HoursRow[] = [
    { day: 'Lunes', hours: '10:30–13:30 · 17:00–19:30' },
    { day: 'Martes', hours: '10:30–13:30 · 17:00–19:30' },
    { day: 'Miércoles', hours: '10:30–13:30' },
    { day: 'Jueves', hours: '10:30–13:30 · 17:00–19:30' },
    { day: 'Viernes', hours: '10:30–19:30' },
    { day: 'Sábado', hours: '10:00–14:00' },
    { day: 'Domingo', hours: null },
  ];

  ngOnInit(): void {
    // No HairSalon block on /contacto: contact-page spec's "Navigational SEO
    // entry" requirement + the resolved decision in
    // sdd/foundation/apply-progress (Engram, project "virginia") both say
    // /contacto stays navigational (null primaryKeyword) with ONLY a
    // BreadcrumbList — see home-page.ts's ngOnInit comment for why HairSalon
    // is emitted per-page rather than once from the shell.
    //
    // Defensively remove it too: if a visitor reaches /contacto via a
    // client-side routerLink navigation from `/` (e.g. the header nav),
    // home-page's HairSalon script would otherwise survive in <head> since
    // hydration never reloads the document (see ports.ts's JsonLdPort.remove
    // doc comment, added this same commit for exactly this gap).
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd(
      'breadcrumb',
      buildBreadcrumbListSchema([
        { name: 'Inicio', path: '' },
        { name: 'Contacto', path: 'contacto' },
      ]),
    );
  }
}
