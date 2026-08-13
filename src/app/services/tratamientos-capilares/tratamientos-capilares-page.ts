import { Component, OnInit, inject } from '@angular/core';
import { PzServicePage, type ServiceContent, type ServicePhoto } from '../ui/pz-service-page/pz-service-page';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { buildFaqPageSchema, type FaqEntry } from '../../seo/generators/faq-page.schema';
import { buildServiceSchema } from '../../seo/generators/service.schema';
import { seoData } from '../../seo/domain/route-seo';
import { pricingFor } from '../domain/pricing';
import type { ServicePath } from '../domain/service-index';

const PATH: ServicePath = 'tratamientos-capilares';

// H1 comes from the registry's `primaryKeyword`, unedited (service-pages
// spec, "Unique primary keyword, registry-driven, live status") — read at
// module load, never hand-retyped, so it can't drift from `title`/the
// keyword-uniqueness validator's input.
const REGISTRY = seoData(PATH);
if (REGISTRY.primaryKeyword === null) {
  throw new Error('[tratamientos-capilares-page] registry entry has no primaryKeyword');
}
const PRIMARY_KEYWORD = REGISTRY.primaryKeyword;

const RESULT_PHOTO: ServicePhoto = {
  base: 'resultado-olivo',
  alt: 'Resultado de un tratamiento capilar botánico reparador, planta olivo',
};

const BEFORE_AFTER: readonly [ServicePhoto, ServicePhoto, ServicePhoto] = [
  {
    base: 'antes-despues-olivo-1',
    alt: 'Antes y después de un ritual capilar reparador sobre cabello dañado, caso 1',
  },
  {
    base: 'antes-despues-olivo-2',
    alt: 'Antes y después de un tratamiento capilar tras coloración química, caso 2',
  },
  {
    base: 'antes-despues-olivo-3',
    alt: 'Antes y después de un tratamiento capilar para cuero cabelludo sensible, caso 3',
  },
];

// FAQ, 4-6 real questions (service-pages spec, "FAQ count and schema
// match") — this exact array reference is also passed to
// `buildFaqPageSchema` below so the rendered questions and the FAQPage
// JSON-LD can never drift apart.
const FAQ: readonly FaqEntry[] = [
  {
    question: '¿Con qué frecuencia debo hacerme un tratamiento capilar?',
    answer:
      'Depende del estado de tu fibra y de cuánto la sometas a procesos químicos o calor — Virginia te da una referencia orientativa al terminar la primera sesión, según tu caso concreto y tu rutina diaria.',
  },
  {
    question: '¿Sirve para cabello ya dañado por decoloraciones?',
    answer:
      'Sí, es precisamente uno de los casos donde más se nota la diferencia: el ritual se ajusta a fibra ya trabajada, reforzando lo que la decoloración ha debilitado sin sellarlo por fuera.',
  },
  {
    question: '¿Incluye masaje del cuero cabelludo?',
    answer:
      'Sí, el masaje forma parte del ritual, no es un extra aparte — además de ser agradable, ayuda a activar la circulación en la raíz durante toda la sesión.',
  },
  {
    question: '¿Deja el pelo con silicona o efecto artificial?',
    answer:
      'No. El objetivo es reparar la fibra de verdad, no sellarla por fuera con silicona para que parezca reparada solo al tacto durante un par de lavados y luego vuelva a notarse dañada.',
  },
  {
    question: '¿Puedo hacerlo el mismo día que me coloreo el pelo?',
    answer:
      'Se valora en la consulta previa: en algunos casos conviene combinarlo en la misma cita y en otros es mejor espaciarlo, según cómo responda tu cuero cabelludo ese día concreto.',
  },
  {
    question: '¿Es solo para cabello dañado o también preventivo?',
    answer:
      'Funciona en ambos casos: como reparación si ya notas daño, o como mantenimiento preventivo si simplemente quieres cuidar la fibra antes de que aparezcan problemas visibles.',
  },
];

const CONTENT: ServiceContent = {
  path: PATH,
  // Contains the primary keyword, is not equal to it — see the sibling
  // coloración page for the full rationale (exact-match keyword stuffing).
  h1: 'Tratamiento capilar en Ciudad Real que repara la fibra sin sellarla con silicona',
  valueProp:
    'Rituales botánicos con masaje del cuero cabelludo incluido, pensados para reparar de verdad, no para maquillar el pelo por fuera.',
  latinBinomial: 'Olea europaea',
  resultPhoto: RESULT_PHOTO,
  beforeAfter: BEFORE_AFTER,
  pricing: pricingFor(PATH),
  faq: FAQ,
  // Pairing map (BRIEF §2): tratamientos capilares ↔ coloración vegetal, rastas.
  crossLinks: ['coloracion-vegetal-aveda', 'rastas'],
};

/**
 * `/tratamientos-capilares` — service-pages spec, nine-part anatomy
 * rendered through `pz-service-page` (Slice 2b). After this route ships,
 * all five service routes are mutually cross-link-resolvable and every
 * `route-seo.registry.json` service entry is `'live'` (tasks.md Slice 5).
 * Emits `Service` (no `offers` while `pricing` is pending), `FAQPage`, and
 * `BreadcrumbList` JSON-LD; defensively removes any stale `hair-salon`
 * block left by a client-side navigation from `/`.
 */
@Component({
  selector: 'app-tratamientos-capilares-page',
  imports: [PzServicePage],
  templateUrl: './tratamientos-capilares-page.html',
})
export class TratamientosCapilaresPage implements OnInit {
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
