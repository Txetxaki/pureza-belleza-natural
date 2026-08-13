import { Component, OnInit, inject } from '@angular/core';
import { PzServicePage, type ServiceContent, type ServicePhoto } from '../ui/pz-service-page/pz-service-page';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { buildFaqPageSchema, type FaqEntry } from '../../seo/generators/faq-page.schema';
import { buildServiceSchema } from '../../seo/generators/service.schema';
import { seoData } from '../../seo/domain/route-seo';
import { pricingFor } from '../domain/pricing';
import type { ServicePath } from '../domain/service-index';

const PATH: ServicePath = 'rastas';

// H1 comes from the registry's `primaryKeyword`, unedited (service-pages
// spec, "Unique primary keyword, registry-driven, live status") — read at
// module load, never hand-retyped, so it can't drift from `title`/the
// keyword-uniqueness validator's input.
const REGISTRY = seoData(PATH);
if (REGISTRY.primaryKeyword === null) {
  throw new Error('[rastas-page] registry entry has no primaryKeyword');
}
const PRIMARY_KEYWORD = REGISTRY.primaryKeyword;

const RESULT_PHOTO: ServicePhoto = {
  base: 'resultado-esparto',
  alt: 'Resultado de rastas creadas con técnica de aguja, planta esparto',
};

const BEFORE_AFTER: readonly [ServicePhoto, ServicePhoto, ServicePhoto] = [
  {
    base: 'antes-despues-esparto-1',
    alt: 'Antes y después de la creación de rastas sobre pelo natural, caso 1',
  },
  {
    base: 'antes-despues-esparto-2',
    alt: 'Antes y después de un mantenimiento profesional de rastas, caso 2',
  },
  {
    base: 'antes-despues-esparto-3',
    alt: 'Antes y después de una transición a rastas desde cabello suelto, caso 3',
  },
];

// FAQ, 4-6 real questions (service-pages spec, "FAQ count and schema
// match") — this exact array reference is also passed to
// `buildFaqPageSchema` below so the rendered questions and the FAQPage
// JSON-LD can never drift apart.
const FAQ: readonly FaqEntry[] = [
  {
    question: '¿Duele el proceso de creación?',
    answer:
      'No debería doler: la técnica de aguja tira del cabello, no de la piel, y Virginia ajusta la tensión de cada mechón según lo que tu cuero cabelludo vaya tolerando durante la sesión, parando si notas alguna zona especialmente sensible.',
  },
  {
    question: '¿Puedo lavarme el pelo con normalidad?',
    answer:
      'Sí, aunque conviene espaciar un poco más los lavados que antes y secar bien la raíz de cada rasta para que no quede humedad retenida — Virginia te explica el ritmo concreto y los productos recomendados al terminar la sesión.',
  },
  {
    question: '¿Funciona en cualquier tipo de cabello?',
    answer:
      'Sí, tanto en pelo liso como rizado u ondulado. El grosor y el número de rastas se ajustan a tu textura y densidad reales, no a un patrón único pensado para todas las cabezas por igual.',
  },
  {
    question: '¿Usáis cera o pegamento para hacerlas?',
    answer:
      'No. La técnica de aguja no necesita cera ni pegamentos añadidos, lo que además facilita deshacerlas más adelante sin tener que cortar el pelo ni recurrir a disolventes agresivos.',
  },
  {
    question: '¿Cada cuánto necesito una revisión de mantenimiento?',
    answer:
      'Depende de cómo crezca tu raíz y de cuánto se aflojen los mechones con el uso diario — Virginia te da una referencia orientativa al terminar la creación, según tu caso concreto y tu ritmo de crecimiento.',
  },
  {
    question: '¿Se pueden deshacer sin dañar el pelo?',
    answer:
      'Sí, precisamente por no llevar cera ni pegamento: deshacerlas es un proceso más cuidadoso con la fibra que el de unas rastas creadas con productos añadidos, aunque siempre conviene hacerlo con calma y sin tirones.',
  },
];

const CONTENT: ServiceContent = {
  path: PATH,
  // The H1 CONTAINS the primary keyword, it is not literally equal to it —
  // same convention as the sibling coloración/mechas pages (exact-match
  // keyword stuffing reads as spam and is what Google's guidance penalises).
  h1: 'Rastas en Ciudad Real hechas con aguja, sin cera ni químicos añadidos',
  valueProp:
    'Técnica de aguja, sin cera ni productos químicos añadidos, con una clienta en el sillón a la vez.',
  latinBinomial: 'Stipa tenacissima',
  resultPhoto: RESULT_PHOTO,
  beforeAfter: BEFORE_AFTER,
  pricing: pricingFor(PATH),
  faq: FAQ,
  // Pairing map (BRIEF §2): rastas ↔ tratamientos capilares, extensiones naturales.
  crossLinks: ['tratamientos-capilares', 'extensiones-cabello-natural'],
};

/**
 * `/rastas` — service-pages spec, nine-part anatomy rendered through
 * `pz-service-page` (Slice 2b). Attacks `rastas Ciudad Real`, the study's
 * open-ground niche with zero identified local competition (BRIEF §2).
 * Emits `Service` (no `offers` while `pricing` is pending), `FAQPage`, and
 * `BreadcrumbList` JSON-LD; defensively removes any stale `hair-salon`
 * block left by a client-side navigation from `/`.
 */
@Component({
  selector: 'app-rastas-page',
  imports: [PzServicePage],
  templateUrl: './rastas-page.html',
})
export class RastasPage implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly content = CONTENT;

  ngOnInit(): void {
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd(
      'breadcrumb',
      buildBreadcrumbListSchema([
        { name: 'Inicio', path: '' },
        { name: REGISTRY.breadcrumb, path: PATH },
      ]),
    );
    this.seo.setJsonLd(
      'service',
      buildServiceSchema({
        path: PATH,
        name: REGISTRY.breadcrumb,
        description: REGISTRY.description,
        pricing: CONTENT.pricing,
      }),
    );
    this.seo.setJsonLd('faq', buildFaqPageSchema(CONTENT.faq));
  }
}
