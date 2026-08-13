import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { PRICING } from '../../domain/pricing';
import { buildFaqPageSchema } from '../../../seo/generators/faq-page.schema';
import { PzServicePage, type ServiceContent } from './pz-service-page';

const FIXTURE: ServiceContent = {
  path: 'coloracion-vegetal-aveda',
  h1: 'Coloración sin amoniaco Ciudad Real',
  valueProp: 'Color botánico Aveda que respeta tu cuero cabelludo y tu tiempo.',
  latinBinomial: 'Rosmarinus officinalis',
  resultPhoto: {
    base: 'resultado-romero',
    alt: 'Resultado de coloración vegetal, planta romero',
  },
  beforeAfter: [
    { base: 'antes-despues-romero-1', alt: 'Antes y después, caso 1' },
    { base: 'antes-despues-romero-2', alt: 'Antes y después, caso 2' },
    { base: 'antes-despues-romero-3', alt: 'Antes y después, caso 3' },
  ],
  pricing: PRICING['coloracion-vegetal-aveda'],
  faq: [
    { question: '¿Cuánto dura la coloración?', answer: 'Entre 90 y 120 minutos según tu melena.' },
    { question: '¿Es compatible con mechas previas?', answer: 'Sí, se valora en la consulta previa.' },
    { question: '¿Necesito preparación antes de venir?', answer: 'No, basta con venir con el pelo limpio.' },
    { question: '¿Cubre canas al 100%?', answer: 'Sí, con cobertura completa y uniforme.' },
  ],
  crossLinks: ['tratamientos-capilares', 'mechas-babylights-balayage'],
};

@Component({
  selector: 'test-host',
  imports: [PzServicePage],
  template: `
    <pz-service-page [content]="content">
      <p pzWhatIs>
        QUE_ES_MARKER — pensado para quien busca un color que respete su cuero cabelludo sin
        renunciar a un acabado impecable.
      </p>
      <p pzProcess>
        PROCESO_MARKER — Virginia valora tu melena, mezcla el pigmento botánico en el momento y
        aplica la coloración paso a paso, vigilando el tiempo de exposición en todo momento.
      </p>
    </pz-service-page>
  `,
})
class TestHost {
  content: ServiceContent = FIXTURE;
}

describe('PzServicePage (design.md D1/D2; service-pages spec)', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('binds exactly one [data-planta] scope — the host element — matching the registry planta for content().path (D2, "Single accent scope per page")', async () => {
    const el = await render();
    const scoped = el.querySelectorAll('[data-planta]');

    expect(scoped).toHaveLength(1);
    expect(scoped[0].tagName.toLowerCase()).toBe('pz-service-page');
    expect(scoped[0].getAttribute('data-planta')).toBe('romero');
  });

  it('renders all nine anatomy sections in DOM order ("Anatomy parts present and ordered")', async () => {
    const el = await render();
    const selector = [
      '.pz-service-page__hero',
      '.pz-service-page__result-photo',
      '.pz-service-page__what-is',
      '.pz-service-page__process',
      '.pz-service-page__pricing',
      '.pz-service-page__before-after',
      '.pz-service-page__faq',
      '.pz-service-page__cta-band',
      '.pz-service-page__cross-links',
    ].join(', ');

    const found = Array.from(el.querySelectorAll(selector)).map((node) =>
      Array.from(node.classList).find((cls) => cls.startsWith('pz-service-page__')),
    );

    expect(found).toEqual([
      'pz-service-page__hero',
      'pz-service-page__result-photo',
      'pz-service-page__what-is',
      'pz-service-page__process',
      'pz-service-page__pricing',
      'pz-service-page__before-after',
      'pz-service-page__faq',
      'pz-service-page__cta-band',
      'pz-service-page__cross-links',
    ]);
  });

  it('derives the eyebrow from the registry breadcrumb + planta — never a hand-typed duplicate', async () => {
    const el = await render();
    const eyebrow = el.querySelector('.pz-service-page__hero .pz-eyebrow--accent');

    expect(eyebrow?.textContent?.trim()).toBe('Coloración Vegetal · romero');
  });

  it('projects the "qué es y para quién" and "cómo lo hace Virginia" slots into their respective anatomy sections, in order', async () => {
    const el = await render();

    expect(el.querySelector('.pz-service-page__what-is')?.textContent).toContain('QUE_ES_MARKER');
    expect(el.querySelector('.pz-service-page__what-is')?.textContent).not.toContain(
      'PROCESO_MARKER',
    );
    expect(el.querySelector('.pz-service-page__process')?.textContent).toContain(
      'PROCESO_MARKER',
    );
  });

  it('renders the result photo and exactly three before/after photos via pz-photo-pending — no fabricated imagery', async () => {
    const el = await render();

    expect(el.querySelector('.pz-service-page__result-photo .pz-photo-pending')).toBeTruthy();
    expect(el.querySelectorAll('.pz-service-page__before-after .pz-photo-pending')).toHaveLength(
      3,
    );
  });

  it('renders "Consultar" and the pending note for price/duration while pricing is pending — never a fabricated figure ("Pending entry renders Consultar")', async () => {
    const el = await render();
    const pricingSection = el.querySelector('.pz-service-page__pricing');

    expect(pricingSection?.textContent).toContain('Consultar');
    expect(pricingSection?.textContent).toContain(FIXTURE.pricing.note);
    expect(pricingSection?.textContent).not.toMatch(/\d+\s*(min|€)/);
  });

  it('renders the FAQ 1:1 with the input array, and its length matches buildFaqPageSchema\'s mainEntity ("FAQ count and schema match")', async () => {
    const el = await render();
    const rendered = el.querySelectorAll('.pz-service-page__faq-item dt');
    const schema = buildFaqPageSchema(FIXTURE.faq) as { mainEntity: unknown[] };

    expect(rendered).toHaveLength(FIXTURE.faq.length);
    expect(schema.mainEntity).toHaveLength(rendered.length);
    expect(rendered[0].textContent?.trim()).toBe(FIXTURE.faq[0].question);
  });

  it('renders both the /reservar CTA and a wa.me WhatsApp CTA ("Both CTAs present")', async () => {
    const el = await render();
    const anchors = Array.from(el.querySelectorAll('a.pz-cta'));

    expect(anchors.some((a) => a.getAttribute('href') === '/reservar')).toBe(true);
    expect(anchors.some((a) => a.getAttribute('href')?.startsWith('https://wa.me'))).toBe(true);
  });

  it('renders exactly the two cross-link paths passed in, no more, no fewer ("Cross-links match the pairing map")', async () => {
    const el = await render();
    const links = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('.pz-service-page__cross-links a'),
    );

    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/tratamientos-capilares',
      '/mechas-babylights-balayage',
    ]);
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'Rituales Capilares',
      'Mechas de Autor',
    ]);
  });
});
