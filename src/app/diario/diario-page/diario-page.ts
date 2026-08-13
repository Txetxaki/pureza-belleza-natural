import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { POSTS_MANIFEST } from '../domain/post-manifest';

/**
 * `/diario` — diario spec: lists the three launch articles with title + a
 * one-line standfirst + link to `/diario/:slug`. H1 and `<title>` carry NO
 * "Ciudad Real" (diario spec, "Title/H1 clean" — title/H1 only, the
 * registry `description` below deliberately keeps it and stays exempt).
 */
@Component({
  selector: 'app-diario-page',
  imports: [RouterLink],
  templateUrl: './diario-page.html',
  styleUrl: './diario-page.scss',
})
export class DiarioPage implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly posts = POSTS_MANIFEST;

  ngOnInit(): void {
    // Defensive removal on a client-side navigation from `/` — same gap
    // documented in contact-page.ts's ngOnInit.
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd(
      'breadcrumb',
      buildBreadcrumbListSchema([
        { name: 'Inicio', path: '' },
        { name: 'Diario', path: 'diario' },
      ]),
    );
  }
}
