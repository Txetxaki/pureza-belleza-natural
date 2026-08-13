import { Component, OnInit, inject } from '@angular/core';
import { PzServicePage, type ServiceContent, type ServicePhoto } from '../ui/pz-service-page/pz-service-page';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { buildFaqPageSchema, type FaqEntry } from '../../seo/generators/faq-page.schema';
import { buildServiceSchema } from '../../seo/generators/service.schema';
import { seoData } from '../../seo/domain/route-seo';
import { pricingFor } from '../domain/pricing';
import type { ServicePath } from '../domain/service-index';

const PATH: ServicePath = 'mechas-babylights-balayage';

// H1 comes from the registry's `primaryKeyword`, unedited (service-pages
// spec, "Unique primary keyword, registry-driven, live status") — read at
// module load, never hand-retyped, so it can't drift from `title`/the
// keyword-uniqueness validator's input.
const REGISTRY = seoData(PATH);
if (REGISTRY.primaryKeyword === null) {
  throw new Error('[mechas-babylights-balayage-page] registry entry has no primaryKeyword');
}
const PRIMARY_KEYWORD = REGISTRY.primaryKeyword;

const RESULT_PHOTO: ServicePhoto = {
  base: 'resultado-espliego',
  alt: 'Resultado de babylights con efecto de luz natural, planta espliego',
};

const BEFORE_AFTER: readonly [ServicePhoto, ServicePhoto, ServicePhoto] = [
  {
    base: 'antes-despues-espliego-1',
    alt: 'Antes y después de babylights sobre base castaña, caso 1',
  },
  {
    base: 'antes-despues-espliego-2',
    alt: 'Antes y después de balayage sin decolorar en exceso, caso 2',
  },
  {
    base: 'antes-despues-espliego-3',
    alt: 'Antes y después de mechas sobre cabello con decoloración previa, caso 3',
  },
];

// FAQ, 4-6 real questions (service-pages spec, "FAQ count and schema
// match") — this exact array reference is also passed to
// `buildFaqPageSchema` below so the rendered questions and the FAQPage
// JSON-LD can never drift apart.
const FAQ: readonly FaqEntry[] = [
  {
    question: '¿Cuántas sesiones necesito para ver el resultado?',
    answer:
      'En la mayoría de los casos, una sola sesión es suficiente para el efecto de luz natural. Si partes de un color muy oscuro y buscas un aclarado más pronunciado, puede plantearse en dos sesiones para no forzar la fibra en un solo día.',
  },
  {
    question: '¿Decolora todo el cabello?',
    answer:
      'No. Tanto babylights como balayage trabajan solo sobre mechones seleccionados, dejando raíz y base sin decolorar en la mayoría de los diseños — eso es precisamente lo que hace que el crecimiento se note menos.',
  },
  {
    question: '¿Cuál es la diferencia real entre babylights y balayage?',
    answer:
      'Babylights usa mechones muy finos con una técnica de aplicación más minuciosa, pensada para un degradado sutil; balayage se pinta a mano libre y da un efecto algo más marcado. Se elige una u otra según tu densidad de pelo y el resultado que busques.',
  },
  {
    question: '¿Funciona en cabello oscuro?',
    answer:
      'Sí, aunque el proceso y el número de sesiones se ajustan: aclarar sobre una base oscura necesita más control del tiempo de decoloración para no dañar la fibra ni dejar un tono anaranjado.',
  },
  {
    question: '¿Puedo hacerme mechas si ya tengo mechas antiguas o decoloraciones previas?',
    answer:
      'Sí, se valora en la consulta previa. El estado de tu fibra decide cuánta decoloración adicional puede soportar la melena en esta sesión sin comprometer su salud.',
  },
  {
    question: '¿Cuánto dura el mantenimiento?',
    answer:
      'El intervalo entre retoques depende de cómo crezca tu color de base y de cuánto contraste tenga con las mechas — te doy una referencia orientativa al terminar la sesión, según tu caso concreto.',
  },
];

const CONTENT: ServiceContent = {
  path: PATH,
  // Contains the primary keyword, is not equal to it — see the sibling
  // coloración page for the full rationale (exact-match keyword stuffing).
  h1: 'Babylights en Ciudad Real que crecen sin raíz marcada',
  valueProp:
    'Mechas finas y luz natural, técnica de autor pensada para no forzar la decoloración de tu melena.',
  latinBinomial: 'Lavandula angustifolia',
  resultPhoto: RESULT_PHOTO,
  beforeAfter: BEFORE_AFTER,
  pricing: pricingFor(PATH),
  faq: FAQ,
  // Pairing map (BRIEF §2): mechas de autor ↔ coloración vegetal, tratamientos capilares.
  crossLinks: ['coloracion-vegetal-aveda', 'tratamientos-capilares'],
};

/**
 * `/mechas-babylights-balayage` — service-pages spec, nine-part anatomy
 * rendered through `pz-service-page` (Slice 2b). Attacks `babylights Ciudad
 * Real` sideways per the "Raíz Botánica" study (BRIEF §2) instead of the
 * contested `mechas Ciudad Real` term. Emits `Service` (no `offers` while
 * `pricing` is pending), `FAQPage`, and `BreadcrumbList` JSON-LD;
 * defensively removes any stale `hair-salon` block left by a client-side
 * navigation from `/`.
 */
@Component({
  selector: 'app-mechas-babylights-balayage-page',
  imports: [PzServicePage],
  templateUrl: './mechas-babylights-balayage-page.html',
})
export class MechasBabylightsBalayagePage implements OnInit {
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
