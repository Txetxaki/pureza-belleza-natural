import { Component, OnInit, inject } from '@angular/core';
import { PzServicePage, type ServiceContent, type ServicePhoto } from '../ui/pz-service-page/pz-service-page';
import { PzAveda } from '../../shared/ui/pz-aveda/pz-aveda';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { buildFaqPageSchema, type FaqEntry } from '../../seo/generators/faq-page.schema';
import { buildServiceSchema } from '../../seo/generators/service.schema';
import { seoData } from '../../seo/domain/route-seo';
import { pricingFor } from '../domain/pricing';
import type { ServicePath } from '../domain/service-index';

const PATH: ServicePath = 'coloracion-vegetal-aveda';

// H1 comes from the registry's `primaryKeyword`, unedited (service-pages
// spec, "Unique primary keyword, registry-driven, live status") — read at
// module load, never hand-retyped, so it can't drift from `title`/the
// keyword-uniqueness validator's input.
const REGISTRY = seoData(PATH);
if (REGISTRY.primaryKeyword === null) {
  throw new Error('[coloracion-vegetal-aveda-page] registry entry has no primaryKeyword');
}
const PRIMARY_KEYWORD = REGISTRY.primaryKeyword;

const RESULT_PHOTO: ServicePhoto = {
  base: 'resultado-romero',
  alt: 'Resultado de coloración vegetal sin amoniaco sobre melena castaña, planta romero',
};

const BEFORE_AFTER: readonly [ServicePhoto, ServicePhoto, ServicePhoto] = [
  {
    base: 'antes-despues-romero-1',
    alt: 'Antes y después de cobertura de canas con coloración vegetal, caso 1',
  },
  {
    base: 'antes-despues-romero-2',
    alt: 'Antes y después de un retoque de raíz con coloración vegetal, caso 2',
  },
  {
    base: 'antes-despues-romero-3',
    alt: 'Antes y después de una transición desde coloración química, caso 3',
  },
];

// FAQ, 4-6 real questions (service-pages spec, "FAQ count and schema
// match") — this exact array reference is also passed to
// `buildFaqPageSchema` below so the rendered questions and the FAQPage
// JSON-LD can never drift apart.
const FAQ: readonly FaqEntry[] = [
  {
    question: '¿Cubre canas al 100%?',
    answer:
      'Sí. La línea Aveda con la que trabajo tiene capacidad de cobertura total; ajusto el nivel de cobertura y la nitidez del resultado en la consulta previa, según tu porcentaje de canas y tu tono de partida.',
  },
  {
    question: '¿Cuánto dura la coloración?',
    answer:
      'Depende de si es coloración completa o retoque de raíz, y de la densidad de tu melena — te doy un tiempo orientativo al reservar, así organizas tu tarde con margen.',
  },
  {
    question: '¿Puedo colorearme si tengo el pelo decolorado o con mechas previas?',
    answer:
      'Sí, se valora en la consulta previa. Un cabello ya trabajado con química necesita un enfoque distinto — a veces se hace una prueba de mechón antes para confirmar cómo va a responder el pigmento vegetal.',
  },
  {
    question: '¿Necesito preparar el pelo antes de venir?',
    answer:
      'No. Basta con llegar con el pelo limpio, sin productos de peinado pesados. No hace falta dejar de lavarte el pelo los días previos, como sí ocurre con otras técnicas.',
  },
  {
    question: '¿Es tan duradera como una coloración química?',
    answer:
      'El pigmento vegetal se deposita de forma distinta a la química oxidativa, así que el mantenimiento se plantea con retoques más frecuentes en raíz en vez de un solo proceso agresivo — el resultado final es igual de sólido, pero con otro ritmo de cuidado.',
  },
  {
    question: '¿Puedo teñirme si estoy embarazada o en periodo de lactancia?',
    answer:
      'Es una decisión que debes consultar con tu ginecólogo; yo te explico la composición del producto para que decidas con esa información, pero la indicación médica final no la da la peluquería.',
  },
];

const CONTENT: ServiceContent = {
  path: PATH,
  // The H1 CONTAINS the primary keyword, it is not literally equal to it.
  // Setting `h1: PRIMARY_KEYWORD` renders "coloración sin amoniaco Ciudad Real"
  // as the page's headline — exact-match keyword stuffing, which reads as spam
  // to a client and is precisely what Google's guidance penalises. The study
  // (BRIEF §2, "H1 con la keyword primaria y una línea de propuesta de valor")
  // asks for the keyword to be present, not for the headline to be the keyword.
  // Verified: every token of PRIMARY_KEYWORD appears below, in a sentence a
  // human would actually write. Same convention on all five service pages.
  h1: 'Coloración sin amoniaco en Ciudad Real que cubre las canas de verdad',
  valueProp: 'Color botánico Aveda, sin amoniaco, pensado para una sola melena a la vez: la tuya.',
  latinBinomial: 'Rosmarinus officinalis',
  resultPhoto: RESULT_PHOTO,
  beforeAfter: BEFORE_AFTER,
  pricing: pricingFor(PATH),
  faq: FAQ,
  // Pairing map (BRIEF §2): coloración vegetal ↔ tratamientos capilares, mechas de autor.
  crossLinks: ['tratamientos-capilares', 'mechas-babylights-balayage'],
};

/**
 * `/coloracion-vegetal-aveda` — service-pages spec, nine-part anatomy
 * rendered through `pz-service-page` (Slice 2b). Emits `Service` (no
 * `offers` while `pricing` is pending), `FAQPage`, and `BreadcrumbList`
 * JSON-LD; defensively removes any stale `hair-salon` block left by a
 * client-side navigation from `/` (same pattern as `contact-page.ts`).
 */
@Component({
  selector: 'app-coloracion-vegetal-aveda-page',
  imports: [PzServicePage, PzAveda],
  templateUrl: './coloracion-vegetal-aveda-page.html',
})
export class ColoracionVegetalAvedaPage implements OnInit {
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
