import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PzCta } from '../../shared/ui/pz-cta/pz-cta';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { SITE } from '../../seo/domain/site';
import { buildTelUrl, buildWhatsAppUrl } from '../../shared/utils/contact-links';

/**
 * `/reservar` — reservar-page spec: the conversion page explaining HOW
 * booking works and WHAT to send Virginia. Deliberately does NOT repeat
 * `/contacto`'s address/hours/map/NAP (anti-cannibalization rule 3) — links
 * there instead, same pattern already proven on `/el-salon`. Its H1 shares
 * no common keyword phrase with `/contacto`'s H1 (written side by side —
 * see the H1 constant below and contact-page.html's "Hablemos de tu
 * cabello"). WhatsApp-first, `tel:` secondary; no calendar/booking widget in
 * this phase — nothing dynamic to render (decision #2267).
 *
 * `RenderMode.Prerender`, NOT Server (reservar-page spec, corrected —
 * Engram #2310): there is no server-rendered route in this project.
 */
@Component({
  selector: 'app-reservar-page',
  imports: [PzCta, RouterLink],
  templateUrl: './reservar-page.html',
  styleUrl: './reservar-page.scss',
})
export class ReservarPage implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly site = SITE;
  protected readonly whatsappUrl = buildWhatsAppUrl(SITE.telephone);
  protected readonly telUrl = buildTelUrl(SITE.telephone);

  ngOnInit(): void {
    // No HairSalon block here either — only the home route emits it.
    // Defensive removal on a client-side navigation from `/`.
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd(
      'breadcrumb',
      buildBreadcrumbListSchema([
        { name: 'Inicio', path: '' },
        { name: 'Reservar', path: 'reservar' },
      ]),
    );
  }
}
