import { Component, OnInit, inject } from '@angular/core';
import { PzServicePage, type ServiceContent, type ServicePhoto } from '../ui/pz-service-page/pz-service-page';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { buildFaqPageSchema, type FaqEntry } from '../../seo/generators/faq-page.schema';
import { buildServiceSchema } from '../../seo/generators/service.schema';
import { seoData } from '../../seo/domain/route-seo';
import { pricingFor } from '../domain/pricing';
import type { ServicePath } from '../domain/service-index';

const PATH: ServicePath = 'extensiones-cabello-natural';

// H1 comes from the registry's `primaryKeyword`, unedited (service-pages
// spec, "Unique primary keyword, registry-driven, live status") — read at
// module load, never hand-retyped, so it can't drift from `title`/the
// keyword-uniqueness validator's input.
const REGISTRY = seoData(PATH);
if (REGISTRY.primaryKeyword === null) {
  throw new Error('[extensiones-cabello-natural-page] registry entry has no primaryKeyword');
}
const PRIMARY_KEYWORD = REGISTRY.primaryKeyword;

const RESULT_PHOTO: ServicePhoto = {
  base: 'resultado-vid',
  alt: 'Resultado de extensiones de cabello natural con integración invisible, planta vid',
};

const BEFORE_AFTER: readonly [ServicePhoto, ServicePhoto, ServicePhoto] = [
  {
    base: 'antes-despues-vid-1',
    alt: 'Antes y después de extensiones de cabello natural para ganar densidad, caso 1',
  },
  {
    base: 'antes-despues-vid-2',
    alt: 'Antes y después de extensiones de cabello natural para ganar longitud, caso 2',
  },
  {
    base: 'antes-despues-vid-3',
    alt: 'Antes y después de un mantenimiento de extensiones de cabello natural, caso 3',
  },
];

// FAQ, 4-6 real questions (service-pages spec, "FAQ count and schema
// match") — this exact array reference is also passed to
// `buildFaqPageSchema` below so the rendered questions and the FAQPage
// JSON-LD can never drift apart.
const FAQ: readonly FaqEntry[] = [
  {
    question: '¿Se nota que llevo extensiones?',
    answer:
      'Si la integración y el tono se ajustan bien, no debería notarse: por eso dedico tiempo a igualar el color a la luz natural y a colocar cada extensión bajo tu propio pelo, no encima.',
  },
  {
    question: '¿Dañan mi cabello natural?',
    answer:
      'Bien colocadas y con el peso repartido de forma uniforme, no deberían dañar tu melena — el riesgo aparece cuando se concentra demasiado peso en pocas zonas, por eso la valoración previa es tan importante en cada caso.',
  },
  {
    question: '¿Puedo hacer deporte o nadar con ellas puestas?',
    answer:
      'Sí, aunque conviene recogerlas bien y secarlas a fondo después para que el punto de integración no quede húmedo demasiado tiempo — te doy recomendaciones concretas según tu rutina de ejercicio.',
  },
  {
    question: '¿Cuánto duran antes de necesitar mantenimiento?',
    answer:
      'Depende de cómo crezca tu propio pelo y de cuánto roce reciban en el día a día — te doy una referencia orientativa al terminar la sesión, según tu caso y tu rutina de cuidado.',
  },
  {
    question: '¿Puedo teñirme el pelo llevando extensiones?',
    answer:
      'Se valora en la consulta previa: al ser cabello natural, admite algunos procesos de color, pero conviene que lo decidamos juntas para no comprometer ni tu melena ni la extensión integrada.',
  },
  {
    question: '¿De dónde viene el cabello que usas?',
    answer:
      'Es cabello natural de origen ético, seleccionado antes de integrarlo en tu melena — resuelvo cualquier duda concreta sobre su procedencia en la consulta previa, sin compromiso.',
  },
];

const CONTENT: ServiceContent = {
  path: PATH,
  // Contains the primary keyword, is not equal to it — see the sibling
  // coloración page for the full rationale (exact-match keyword stuffing).
  h1: 'Extensiones de pelo natural en Ciudad Real que se integran sin dejarse notar',
  valueProp:
    'Cabello 100% natural de origen ético, integrado mechón a mechón para que se mueva y se comporte como el tuyo.',
  latinBinomial: 'Vitis vinifera',
  resultPhoto: RESULT_PHOTO,
  beforeAfter: BEFORE_AFTER,
  pricing: pricingFor(PATH),
  faq: FAQ,
  // Pairing map (BRIEF §2): extensiones naturales ↔ mechas de autor, tratamientos capilares.
  crossLinks: ['mechas-babylights-balayage', 'tratamientos-capilares'],
};

/**
 * `/extensiones-cabello-natural` — service-pages spec, nine-part anatomy
 * rendered through `pz-service-page` (Slice 2b). Emits `Service` (no
 * `offers` while `pricing` is pending), `FAQPage`, and `BreadcrumbList`
 * JSON-LD; defensively removes any stale `hair-salon` block left by a
 * client-side navigation from `/`.
 */
@Component({
  selector: 'app-extensiones-cabello-natural-page',
  imports: [PzServicePage],
  templateUrl: './extensiones-cabello-natural-page.html',
})
export class ExtensionesCabelloNaturalPage implements OnInit {
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
