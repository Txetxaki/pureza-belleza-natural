import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PzCta } from '../../shared/ui/pz-cta/pz-cta';
import { PzPhotoPending } from '../../shared/ui/pz-photo-pending/pz-photo-pending';
import { PzPicture } from '../../shared/ui/pz-picture/pz-picture';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { SITE } from '../../seo/domain/site';
import { buildWhatsAppUrl } from '../../shared/utils/contact-links';

/**
 * `/el-salon` — salon-page spec: navigational trust page, no primary
 * keyword (registry entry already carries `primaryKeyword: null` and is
 * exempt from `validate-keyword-uniqueness.mjs` by that same null value —
 * no script change needed, tasks.md 6.3). Photo-less at launch (BRIEF §4):
 * only existing `atmosfera-*` botanical imagery for non-interior visuals,
 * plus exactly ONE `pz-photo-pending` slot for the pending real interior
 * photography — never an AI-generated interior/people shot, never stock.
 *
 * Deliberately does NOT repeat `/contacto`'s NAP/hours/map (anti-
 * cannibalization) — it links there instead for the practical details.
 */
@Component({
  selector: 'app-el-salon-page',
  imports: [PzCta, PzPhotoPending, PzPicture, RouterLink],
  templateUrl: './el-salon-page.html',
  styleUrl: './el-salon-page.scss',
})
export class ElSalonPage implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly whatsappUrl = buildWhatsAppUrl(SITE.telephone);

  ngOnInit(): void {
    // No HairSalon block here either — same reasoning as /contacto (only the
    // home route emits it). Defensive removal on a client-side navigation
    // from `/`.
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd(
      'breadcrumb',
      buildBreadcrumbListSchema([
        { name: 'Inicio', path: '' },
        { name: 'El Salón', path: 'el-salon' },
      ]),
    );
  }
}
